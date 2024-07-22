import { isMainThread, parentPort, workerData } from "node:worker_threads";
import { Address } from "@ton/core";

import { calculateNotcoinJettonWalletStateinit, calculateVanityStateinit } from "../contracts";
import {
  isTwoAddrHashSameShard,
  CPUWorkers,
  distributeSaultToWorkersWithData,
  type WorkerDataWithSault,
} from "../utils";

type WorkerData = { deployerAddress: string };
type WorkerResultData = { stateinitBase64: string; sault: string };

if (isMainThread) {
  async function main() {
    const cpuWorkers = new CPUWorkers();

    const deployerAddress = "UQCtwXRh0SQe780YnH1QqUBF8-kYSctm1s0__gcxrWs_mmii";

    const result = await cpuWorkers.waitFirst<WorkerDataWithSault<WorkerData>, WorkerResultData>(
      __filename,
      distributeSaultToWorkersWithData(cpuWorkers.count, { deployerAddress })
    );

    console.log("result", result);
  }

  main();
} else {
  const { sault, data }: WorkerDataWithSault<WorkerData> = workerData;

  const deployerAddress = Address.parse(data.deployerAddress);

  console.log(`Worker #${sault.index}: mining started...`);

  for (let i = sault.from; i < sault.to; i++) {
    const vanityStateinit = calculateVanityStateinit(deployerAddress, i);
    const stateinit = calculateNotcoinJettonWalletStateinit(deployerAddress);
    const sameShard = isTwoAddrHashSameShard(stateinit.hash(), vanityStateinit.hash(), 64);
    if (sameShard) {
      const stateinitBase64 = stateinit.toBoc().toString("base64");
      const sault = i.toString();

      parentPort!.postMessage({ stateinitBase64, sault });
      break;
    }
  }
}
