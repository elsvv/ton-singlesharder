import { isMainThread, parentPort, workerData } from "node:worker_threads";
import { Address, type Cell } from "@ton/core";

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

type MineParams = MineDeployerParams &
  (({ mode: "address" } & MineAddressParams) | ({ mode: "jetton" } & MineJettonParams));

type WorkerResultData = { stateinitBase64: string; sault: string };

const SHARD_MAX_DEPTH = 16;

async function mineVanitySault(params: MineParams) {
  if (!isMainThread) throw new Error("Mine called not from main thread");

  const cpuWorkers = new CPUWorkers();

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

if (!isMainThread) {
  const { sault, data }: WorkerDataWithSault<MineParams> = workerData;

  console.log(`Worker #${sault.index}: mining started...`);
  const deployerAddress = Address.parse(data.deployerAddress);

  if (data.mode === "jetton") {
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

    for (let i = sault.from; i < sault.to; i++) {
      const vanityStateinit = calculateVanityStateinit(deployerAddress, i);
      const vanityStateinitHash = vanityStateinit.hash();
      const stateinit = calculateTargetJettonStateinit(vanityStateinitHash);
      const sameShard = isTwoAddrHashSameShard(
        stateinit.hash(),
        vanityStateinitHash,
        SHARD_MAX_DEPTH
      );
      if (sameShard) {
        const stateinitBase64 = vanityStateinit.toBoc().toString("base64");
        const sault = i.toString();

        parentPort!.postMessage({ stateinitBase64, sault });
        break;
      }
    }
  } else if (data.mode === "address") {
    const targetAddress = Address.parse(data.targetAddress);

    for (let i = sault.from; i < sault.to; i++) {
      const vanityStateinit = calculateVanityStateinit(deployerAddress, i);
      const vanityStateinitHash = vanityStateinit.hash();
      const sameShard = isTwoAddrHashSameShard(
        targetAddress.hash,
        vanityStateinitHash,
        SHARD_MAX_DEPTH
      );
      if (sameShard) {
        const stateinitBase64 = vanityStateinit.toBoc().toString("base64");
        const sault = i.toString();

        parentPort!.postMessage({ stateinitBase64, sault });
        break;
      }
    }
  } else {
    throw new Error("Unknown mine mode");
  }
}
