import { isMainThread, parentPort, workerData } from "node:worker_threads";
import { Address, Cell } from "@ton/core";

import {
  calculateNotcoinJettonWalletStateinit,
  calculateTonstakersJettonWalletStateinit,
  calculateUsdtJettonWalletStateinit,
  calculateVanityStateinit,
} from "../contracts";
import {
  isTwoAddrHashSameShard,
  CPUWorkers,
  distributeSaultToWorkersWithData,
  type WorkerDataWithSault,
} from "../utils";

type MineDeployerParams = {
  deployerAddress: string;
  additionalDataSliceBase64?: string;
};

type MineJettonParams = { jetton: "usdt" | "notcoin" | "tonstakers" };

type MineAddressParams = { targetAddress: string };

type MineAddressAndJettonParams = MineJettonParams & MineAddressParams;

type MineParams =
  | MineDeployerParams &
      (
        | ({ mode: "address" } & MineAddressParams)
        | ({ mode: "jetton" } & MineJettonParams)
        | ({ mode: "addressAndJetton" } & MineAddressAndJettonParams)
      );

type WorkerResultData = { stateinitBase64: string; sault: string };

const SHARD_MAX_DEPTH = 10;

async function mineVanitySault(params: MineParams) {
  if (!isMainThread) throw new Error("Mine called not from main thread");

  const cpuWorkers = new CPUWorkers();
  console.log(`Start mining sault with SHARD_MAX_DEPTH=${SHARD_MAX_DEPTH}`);

  return cpuWorkers.waitFirst<WorkerDataWithSault<MineParams>, WorkerResultData>(
    __filename,
    distributeSaultToWorkersWithData(cpuWorkers.count, params)
  );
}

export async function mineVanitySaultForJetton(params: MineDeployerParams & MineJettonParams) {
  return mineVanitySault({ ...params, mode: "jetton" });
}

export async function mineVanitySaultForAddress(params: MineDeployerParams & MineAddressParams) {
  return mineVanitySault({ ...params, mode: "address" });
}

export async function mineVanitySaultForAddressAndJetton(
  params: MineDeployerParams & MineAddressAndJettonParams
) {
  return mineVanitySault({ ...params, mode: "addressAndJetton" });
}

if (!isMainThread) {
  function endMine(stateinit: Cell, sault: bigint) {
    const address = new Address(0, stateinit.hash());

    parentPort!.postMessage({
      stateinitBase64: stateinit.toBoc().toString("base64"),
      sault: sault.toString(),
      address: address.toRawString(),
    });
  }

  const { sault, data }: WorkerDataWithSault<MineParams> = workerData;

  console.log(`Worker #${sault.index}: mining started...`);
  const deployerAddress = Address.parse(data.deployerAddress);

  const additionalDataBuilder =
    data.additionalDataSliceBase64 === undefined
      ? undefined
      : Cell.fromBase64(data.additionalDataSliceBase64).asBuilder();

  if (data.mode === "jetton" || data.mode === "addressAndJetton") {
    const calculateJettonStateinit = (
      jetton: MineJettonParams["jetton"]
    ): ((ownerAddressHash: Buffer) => Cell) => {
      switch (jetton) {
        case "notcoin":
          return calculateNotcoinJettonWalletStateinit;
        case "usdt":
          return calculateUsdtJettonWalletStateinit;
        case "tonstakers":
          return calculateTonstakersJettonWalletStateinit;
        default:
          throw new Error("Unknown jetton");
      }
    };

    const calculateTargetJettonStateinit = calculateJettonStateinit(data.jetton);

    if (data.mode === "jetton") {
      for (let i = sault.from; i < sault.to; i++) {
        const vanityStateinit = calculateVanityStateinit(deployerAddress, i, additionalDataBuilder);
        const vanityStateinitHash = vanityStateinit.hash();
        const jettonStateinit = calculateTargetJettonStateinit(vanityStateinitHash);
        const sameShard = isTwoAddrHashSameShard(
          jettonStateinit.hash(),
          vanityStateinitHash,
          SHARD_MAX_DEPTH
        );
        if (sameShard) {
          endMine(vanityStateinit, i);
          break;
        }
      }
    } else if (data.mode === "addressAndJetton") {
      const targetAddress = Address.parse(data.targetAddress);

      for (let i = sault.from; i < sault.to; i++) {
        const vanityStateinit = calculateVanityStateinit(deployerAddress, i, additionalDataBuilder);
        const vanityStateinitHash = vanityStateinit.hash();

        if (!isTwoAddrHashSameShard(targetAddress.hash, vanityStateinitHash, SHARD_MAX_DEPTH))
          continue;

        const jettonStateinit = calculateTargetJettonStateinit(vanityStateinitHash);
        const sameShard = isTwoAddrHashSameShard(
          jettonStateinit.hash(),
          vanityStateinitHash,
          SHARD_MAX_DEPTH
        );
        if (sameShard) {
          endMine(vanityStateinit, i);
          break;
        }
      }
    }
  } else if (data.mode === "address") {
    const targetAddress = Address.parse(data.targetAddress);

    for (let i = sault.from; i < sault.to; i++) {
      const vanityStateinit = calculateVanityStateinit(deployerAddress, i, additionalDataBuilder);
      const vanityStateinitHash = vanityStateinit.hash();
      const sameShard = isTwoAddrHashSameShard(
        targetAddress.hash,
        vanityStateinitHash,
        SHARD_MAX_DEPTH
      );
      if (sameShard) {
        endMine(vanityStateinit, i);
        break;
      }
    }
  } else {
    throw new Error("Unknown mine mode");
  }
}
