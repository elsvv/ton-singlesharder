import { isMainThread, parentPort, workerData } from "node:worker_threads";
import { Address, type Cell } from "@ton/core";

import {
  calculateNotcoinJettonWalletStateinit,
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
  jetton: "usdt" | "notcoin";
  deployerAddress: string;
  additionalDataSliceBase64?: string;
};

type WorkerData = MineParams;
type WorkerResultData = { stateinitBase64: string; sault: string };

export async function mine(params: MineParams) {
  if (!isMainThread) throw new Error("Mine called not from main thread");

  const cpuWorkers = new CPUWorkers();

  return cpuWorkers.waitFirst<WorkerDataWithSault<WorkerData>, WorkerResultData>(
    __filename,
    distributeSaultToWorkersWithData(cpuWorkers.count, params)
  );
}

if (!isMainThread) {
  const { sault, data }: WorkerDataWithSault<WorkerData> = workerData;

  function calculateJettonStateinit(jetton: WorkerData["jetton"], ownerAddressHash: Buffer): Cell {
    switch (jetton) {
      case "notcoin":
        return calculateNotcoinJettonWalletStateinit(ownerAddressHash);
      case "usdt":
        return calculateUsdtJettonWalletStateinit(ownerAddressHash);
      default:
        throw new Error("Unknown jetton");
    }
  }

  const deployerAddress = Address.parse(data.deployerAddress);

  console.log(`Worker #${sault.index}: mining started...`);

  for (let i = sault.from; i < sault.to; i++) {
    const vanityStateinit = calculateVanityStateinit(deployerAddress, i);
    const vanityStateinitHash = vanityStateinit.hash();
    const stateinit = calculateJettonStateinit(data.jetton, vanityStateinitHash);
    const sameShard = isTwoAddrHashSameShard(stateinit.hash(), vanityStateinitHash, 16);
    if (sameShard) {
      const stateinitBase64 = stateinit.toBoc().toString("base64");
      const sault = i.toString();

      parentPort!.postMessage({ stateinitBase64, sault });
      break;
    }
  }
}
