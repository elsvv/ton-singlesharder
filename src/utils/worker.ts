import { Worker } from "node:worker_threads";
import os from "node:os";

export class CPUWorkers {
  private cpus: os.CpuInfo[];

  constructor() {
    this.cpus = os.cpus();
  }

  get count() {
    return this.cpus.length;
  }

  waitFirst<T, U>(path: string, getWorkerData: (index: number) => T): Promise<U> {
    return new Promise((resolve) => {
      const workers = this.cpus.map(
        (cpu, index) => new Worker(path, { workerData: getWorkerData(index) })
      );

      workers.forEach((worker, workerIndex) => {
        worker.on("message", (res: U) => {
          workers.forEach((w) => w.terminate());
          resolve(res);
        });

        worker.on("error", (e) => {
          console.log(`Worker ${workerIndex} error:`, e);
        });

        worker.on("exit", (exitCode) => {
          if (exitCode !== 0) {
            console.log(`Worker ${workerIndex} exited with a code: ${exitCode}`);
          } else {
            console.log(`Worker ${workerIndex} successfully exited`);
          }
        });
      });
    });
  }
}

export type DistributedSault = { from: bigint; to: bigint; index: number };

export type WorkerDataWithSault<T extends object> = { data: T } & {
  sault: DistributedSault;
};

export const distributeSaultToWorkersWithData =
  <T extends object>(workersCount: number, data: T) =>
  (index: number): WorkerDataWithSault<T> => {
    const saultMax = 2n ** 256n - 1n;
    const part = saultMax / BigInt(workersCount);

    return { data, sault: { index, from: part * BigInt(index), to: part * BigInt(index + 1) } };
  };
