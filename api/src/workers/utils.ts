import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as os from 'os';
import * as path from 'path';
import { checkFieldNames } from '../data/modules/fields/utils';
import { deleteFile, importBulkStream } from '../data/utils';
import { Companies, Customers } from '../db/models';
import { CUSTOMER_SELECT_OPTIONS } from '../db/models/definitions/constants';
import {
  default as ImportHistories,
  default as ImportHistory
} from '../db/models/ImportHistory';
import { debugImport, debugWorkers } from '../debuggers';
import { bulkInsert } from './bulkInsert';

const { MONGO_URL = '' } = process.env;

export const connect = () =>
  mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true });

dotenv.config();

let workers: any[] = [];
let intervals: any[] = [];

export const createWorkers = (
  workerPath: string,
  workerData: any,
  results: string[]
) => {
  return new Promise((resolve, reject) => {
    // tslint:disable-next-line
    const Worker = require('worker_threads').Worker;

    if (workers && workers.length > 0) {
      return reject(new Error('Workers are busy or not working'));
    }

    const interval = setImmediate(() => {
      results.forEach(result => {
        try {
          const worker = new Worker(workerPath, {
            workerData: {
              ...workerData,
              result
            }
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

export const clearEmptyValues = (objs: any) => {
  for (const obj of objs) {
    Object.keys(obj).forEach(key => {
      if (obj[key] === '' || obj[key] === 'unknown') {
        delete obj[key];
      }

      if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      }
    });
  }

  return objs;
};

export const updateDuplicatedValue = async (
  model: any,
  field: string,
  doc: any
) => {
  return model.updateOne(
    { [field]: doc[field] },
    { $set: { ...doc, modifiedAt: new Date() } }
  );
};

const getWorkerFile = fileName => {
  if (process.env.NODE_ENV !== 'production') {
    return `./src/workers/${fileName}.worker.import.js`;
  }

  if (fs.existsSync('./build/api')) {
    return `./build/api/workers/${fileName}.worker.js`;
  }

  return `./dist/workers/${fileName}.worker.js`;
};

// xls file import, cancel, removal
export const receiveImportRemove = async (content: any) => {
  const { contentType, importHistoryId } = content;

  const importHistory = await ImportHistories.getImportHistory(importHistoryId);

  const results = splitToCore(importHistory.ids || []);

  const workerFile = getWorkerFile('importHistoryRemove');

  const workerPath = path.resolve(workerFile);

  await createWorkers(workerPath, { contentType, importHistoryId }, results);

  return { status: 'ok' };
};

export const receiveImportCancel = () => {
  clearIntervals();

  removeWorkers();

  return { status: 'ok' };
};

export const IMPORT_CONTENT_TYPE = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  LEAD: 'lead',
  PRODUCT: 'product',
  DEAL: 'deal',
  TASK: 'task',
  TICKET: 'ticket'
};

export const beforeImport = async (type: string) => {
  const { LEAD, CUSTOMER, COMPANY } = IMPORT_CONTENT_TYPE;

  const existingEmails: string[] = [];
  const existingPhones: string[] = [];
  const existingCodes: string[] = [];
  const existingNames: string[] = [];

  const commonQuery = { status: { $ne: 'deleted' } };

  if (type === CUSTOMER || type === LEAD) {
    const customerValues = await Customers.find(commonQuery, {
      _id: 0,
      primaryEmail: 1,
      primaryPhone: 1,
      code: 1
    });

    for (const value of customerValues || []) {
      existingEmails.push((value || {}).primaryEmail || '');
      existingPhones.push((value || {}).primaryPhone || '');
      existingCodes.push((value || {}).code || '');
    }
  }

  if (type === COMPANY) {
    const companyValues = await Companies.find(commonQuery, {
      _id: 0,
      primaryName: 1,
      code: 1
    });

    for (const value of companyValues || []) {
      existingNames.push((value || {}).primaryName || '');
      existingCodes.push((value || {}).code || '');
    }
  }

  return {
    existingEmails,
    existingPhones,
    existingCodes,
    existingNames
  };
};

export const receiveImportCreate = async (content: any) => {
  try {
    const {
      fileName,
      type,
      scopeBrandIds,
      user,
      uploadType,
      fileType
    } = content;

    let fieldNames;
    let properties;
    let total = 0;

    if (fileType !== 'csv') {
      throw new Error('Invalid file type');
    }

    const importHistory = await ImportHistory.create({
      contentType: type,
      userId: user._id,
      date: Date.now()
    });

    const { LEAD, CUSTOMER, COMPANY } = IMPORT_CONTENT_TYPE;

    const validationValues = await beforeImport(type);

    const isRowValid = (row: any) => {
      let status;

      const {
        existingCodes,
        existingEmails,
        existingPhones,
        existingNames
      } = validationValues;

      if (type === CUSTOMER || type === LEAD) {
        const { primaryEmail, primaryPhone, code } = row;

        status = existingCodes.includes(code) ? 'code' : null;
        status = existingEmails.includes(primaryEmail) ? 'email' : null;
        status = existingPhones.includes(primaryPhone) ? 'phone' : null;

        return status;
      }

      if (type === COMPANY) {
        const { primaryName, code } = row;

        status = existingNames.includes(primaryName) ? 'name' : null;
        status = existingCodes.includes(code) ? 'code' : null;

        return status;
      }

      return false;
    };

    const handleSave = async rows => {
      let errorMsgs: Error[] = [];

      total += rows.length;

      if (total === 0) {
        throw new Error('Please import at least one row of data');
      }

      if (!fieldNames) {
        const [fields] = rows;

        fieldNames = Object.keys(fields);
        properties = await checkFieldNames(type, fieldNames);
      }

      const result: unknown[] = [];

      for (const row of rows) {
        const hasErrorStatus = isRowValid(row);

        if (!hasErrorStatus) {
          result.push(Object.values(row));
        } else {
          errorMsgs.push(new Error(`Duplicated ${hasErrorStatus}`));
        }
      }

      await bulkInsert({
        user,
        scopeBrandIds,
        contentType: type,
        result,
        properties,
        importHistoryId: importHistory.id
      });

      if (errorMsgs.length > 0) {
        await ImportHistory.updateOne(
          { _id: importHistory.id },
          { $inc: { failed: errorMsgs.length }, $push: { errorMsgs } }
        );

        errorMsgs = [];
      }
    };

    await importBulkStream({
      fileName,
      uploadType,
      bulkLimit: 100,
      save: handleSave
    });

    await ImportHistory.update({ _id: importHistory.id }, { $set: { total } });

    await deleteFile(fileName);

    return { id: importHistory.id };
  } catch (e) {
    debugWorkers(e.message);
    throw e;
  }
};

export const generateUid = () => {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};
export const generatePronoun = value => {
  const pronoun = CUSTOMER_SELECT_OPTIONS.SEX.find(
    sex => sex.label.toUpperCase() === value.toUpperCase()
  );

  return pronoun ? pronoun.value : '';
};
