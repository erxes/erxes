import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as os from 'os';
import { debugImport } from '../debuggers';

dotenv.config();

let workers: any[] = [];
let intervals: any[] = [];

export const createWorkers = (workerPath: string, workerData: any, results: string[]) => {
  return new Promise((resolve, reject) => {
    // tslint:disable-next-line
    const Worker = require('worker_threads').Worker;

    if (workers.length > 0) {
      return reject(new Error('Workers are busy'));
    }

    const interval = setImmediate(() => {
      results.forEach(result => {
        try {
          const worker = new Worker(workerPath, {
            workerData: {
              ...workerData,
              result,
            },
          });

          workers.push(worker);

          worker.on('message', () => {
            removeWorker(worker);
          });

          worker.on('error', e => {
            debugImport(e);
            removeWorker(worker);
          });

          worker.on('exit', code => {
            if (code !== 0) {
              debugImport(`Worker stopped with exit code ${code}`);
            }
          });
        } catch (e) {
          reject(new Error(e));
        }
      });

      clearIntervals();
    });

    intervals.push(interval);

    resolve(true);
  });
};

export const splitToCore = (datas: any[]) => {
  const cpuCount = os.cpus().length;

  const results: any[] = [];

  const calc = Math.ceil(datas.length / cpuCount);

  for (let index = 0; index < cpuCount; index++) {
    const start = index * calc;
    const end = start + calc;
    const row = datas.slice(start, end);

    results.push(row);
  }

  return results;
};

export const removeWorker = worker => {
  workers = workers.filter(workerObj => {
    return worker.threadId !== workerObj.threadId;
  });
};

export const removeWorkers = () => {
  workers.forEach(worker => {
    worker.postMessage('cancel');
  });
};

export const clearIntervals = () => {
  intervals.forEach(interval => {
    clearImmediate(interval);
  });

  intervals = [];
};

const { MONGO_URL = '' } = process.env;

export const connect = () =>
  mongoose.connect(
    MONGO_URL,
    { useNewUrlParser: true, useCreateIndex: true },
  );
