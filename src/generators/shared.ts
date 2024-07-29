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

type MineParams = {
  jetton: "usdt" | "notcoin" | "tonstakers";
  deployerAddress: string;
  additionalDataSliceBase64?: string;
};

type WorkerData = MineParams;
type WorkerResultData = { stateinitBase64: string; sault: string };

const SHARD_MAX_DEPTH = 16;

export async function mineVanitySault(params: MineParams) {
  if (!isMainThread) throw new Error("Mine called not from main thread");

  const cpuWorkers = new CPUWorkers();

  return cpuWorkers.waitFirst<WorkerDataWithSault<WorkerData>, WorkerResultData>(
    __filename,
    distributeSaultToWorkersWithData(cpuWorkers.count, params)
  );
}

if (!isMainThread) {
  const { sault, data }: WorkerDataWithSault<WorkerData> = workerData;

  const calculateJettonStateinit = (
    jetton: WorkerData["jetton"]
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

  const deployerAddress = Address.parse(data.deployerAddress);

  console.log(`Worker #${sault.index}: mining started...`);

  const calculateStateinit = calculateJettonStateinit(data.jetton);

  for (let i = sault.from; i < sault.to; i++) {
    const vanityStateinit = calculateVanityStateinit(deployerAddress, i);
    const vanityStateinitHash = vanityStateinit.hash();
    const stateinit = calculateStateinit(vanityStateinitHash);
    const sameShard = isTwoAddrHashSameShard(
      stateinit.hash(),
      vanityStateinitHash,
      SHARD_MAX_DEPTH
    );
    if (sameShard) {
      const stateinitBase64 = stateinit.toBoc().toString("base64");
      const sault = i.toString();

      parentPort!.postMessage({ stateinitBase64, sault });
      break;
    }
  }
}
