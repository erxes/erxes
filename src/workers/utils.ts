import * as dotenv from 'dotenv';
import * as mongoose from 'mongoose';
import * as os from 'os';
import * as path from 'path';
import { checkFieldNames } from '../data/modules/fields/utils';
import { ImportHistory } from '../db/models';
import ImportHistories from '../db/models/ImportHistory';
import { debugImport } from '../debuggers';

const { MONGO_URL = '' } = process.env;
export const connect = () => mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true });

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

// xls file import, cancel, removal
export const receiveImportRemove = async (content: any) => {
  const { contentType, importHistoryId } = content;

  const importHistory = await ImportHistories.getImportHistory(importHistoryId);

  const results = splitToCore(importHistory.ids || []);

  const workerFile =
    process.env.NODE_ENV === 'production'
      ? `./dist/workers/importHistoryRemove.worker.js`
      : './src/workers/importHistoryRemove.worker.import.js';

  const workerPath = path.resolve(workerFile);

  await createWorkers(workerPath, { contentType, importHistoryId }, results);

  return { status: 'started removing' };
};

export const receiveImportCancel = () => {
  clearIntervals();

  removeWorkers();

  return { status: 'ok' };
};

export const receiveImportXls = async (content: any) => {
  const { type, fieldNames, scopeBrandIds, user, datas } = content;

  if (datas.length === 0) {
    throw new Error('Please import more at least one row of data');
  }

  const properties = await checkFieldNames(type, fieldNames);

  const importHistory = await ImportHistory.create({
    contentType: type,
    total: datas.length,
    userId: user._id,
    date: Date.now(),
  });

  const results: string[] = splitToCore(datas);

  const workerFile =
    process.env.NODE_ENV === 'production'
      ? `./dist/workers/bulkInsert.worker.js`
      : './src/workers/bulkInsert.worker.import.js';

  const workerPath = path.resolve(workerFile);

  const percentagePerData = Number(((1 / datas.length) * 100).toFixed(3));

  const workerData = {
    scopeBrandIds,
    user,
    contentType: type,
    properties,
    importHistoryId: importHistory._id,
    percentagePerData,
  };

  await createWorkers(workerPath, workerData, results);

  return { id: importHistory.id };
};
