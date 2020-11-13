import * as csv from 'csvtojson';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as os from 'os';
import * as path from 'path';
import * as XlsxStreamReader from 'xlsx-stream-reader';
import { checkFieldNames } from '../data/modules/fields/utils';
import { deleteFile, s3Stream, uploadsFolderPath } from '../data/utils';
import { ImportHistory } from '../db/models';
import { CUSTOMER_SELECT_OPTIONS } from '../db/models/definitions/constants';
import ImportHistories from '../db/models/ImportHistory';
import { debugImport, debugWorkers } from '../debuggers';

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

export const clearEmptyValues = (obj: any) => {
  Object.keys(obj).forEach(key => {
    if (obj[key] === '' || obj[key] === 'unknown') {
      delete obj[key];
    }

    if (Array.isArray(obj[key]) && obj[key].length === 0) {
      delete obj[key];
    }
  });

  return obj;
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

const readXlsFile = async (
  fileName: string,
  uploadType: string
): Promise<{ fieldNames: string[]; datas: any[] }> => {
  return new Promise(async (resolve, reject) => {
    let rowCount = 0;

    const usedSheets: any[] = [];

    const xlsxReader = XlsxStreamReader();

    const errorCallback = error => {
      reject(new Error(error.code));
    };

    try {
      const stream =
        uploadType === 'local'
          ? fs.createReadStream(`${uploadsFolderPath}/${fileName}`)
          : await s3Stream(fileName, errorCallback);

      stream.pipe(xlsxReader);

      xlsxReader.on('worksheet', workSheetReader => {
        if (workSheetReader > 1) {
          return workSheetReader.skip();
        }

        workSheetReader.on('row', row => {
          if (rowCount > 100000) {
            return reject(
              new Error('You can only import 100000 rows one at a time')
            );
          }

          if (row.values.length > 0) {
            usedSheets.push(row.values);
            rowCount++;
          }
        });

        workSheetReader.process();
      });

      xlsxReader.on('end', () => {
        const compactedRows: any = [];

        for (const row of usedSheets) {
          if (row.length > 0) {
            row.shift();

            compactedRows.push(row);
          }
        }

        const fieldNames = usedSheets[0];

        // Removing column
        compactedRows.shift();

        return resolve({ fieldNames, datas: compactedRows });
      });

      xlsxReader.on('error', error => {
        return reject(error);
      });
    } catch (e) {
      reject(e);
    }
  });
};

const readCsvFile = async (
  fileName: string,
  uploadType: string
): Promise<{ fieldNames: string[]; datas: any[] }> => {
  return new Promise(async (resolve, reject) => {
    const errorCallback = error => {
      reject(new Error(error.code));
    };

    const mainDatas: any[] = [];

    try {
      const stream =
        uploadType === 'local'
          ? fs.createReadStream(`${uploadsFolderPath}/${fileName}`)
          : await s3Stream(fileName, errorCallback);

      const results = await csv().fromStream(stream);

      if (!results || results.length === 0) {
        return reject(new Error('Please import at least one row of data'));
      }

      if (results && results.length > 100000) {
        return reject(
          new Error('You can only import 100000 rows one at a time')
        );
      }

      const fieldNames: string[] = [];

      for (const [key, value] of Object.entries(results[0])) {
        if (value && typeof value === 'object') {
          const subFields = Object.keys(value || {});

          for (const subField of subFields) {
            fieldNames.push(`${key}.${subField}`);
          }
        } else {
          fieldNames.push(key);
        }
      }

      for (const result of results) {
        let data: any[] = [];

        for (const mainValue of Object.values(result)) {
          if (mainValue) {
            if (typeof mainValue !== 'object') {
              data.push(mainValue || '');
            } else if (typeof mainValue === 'object') {
              const subFieldValues = Object.values(mainValue || {});
              subFieldValues.forEach(subFieldValue => {
                data.push(subFieldValue || '');
              });
            }
          }
        }

        if (data.length > 1) {
          mainDatas.push(data);
        }

        data = [];
      }

      return resolve({ fieldNames, datas: mainDatas });
    } catch (e) {
      return resolve();
    }
  });
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
    let fieldNames: string[] = [];
    let datas: string[] = [];
    let result: any = {};

    switch (fileType) {
      case 'csv':
        result = await readCsvFile(fileName, uploadType);

        fieldNames = result.fieldNames;
        datas = result.datas;

        break;

      case 'xlsx':
        result = await readXlsFile(fileName, uploadType);

        fieldNames = result.fieldNames;
        datas = result.datas;

        break;
    }

    if (datas.length === 0) {
      throw new Error('Please import at least one row of data');
    }

    const properties = await checkFieldNames(type, fieldNames);

    const importHistory = await ImportHistory.create({
      contentType: type,
      total: datas.length,
      userId: user._id,
      date: Date.now()
    });

    const results: string[] = splitToCore(datas);

    const workerFile = getWorkerFile('bulkInsert');

    const workerPath = path.resolve(workerFile);

    const percentagePerData = Number(((1 / datas.length) * 100).toFixed(3));

    const workerData = {
      scopeBrandIds,
      user,
      contentType: type,
      properties,
      importHistoryId: importHistory._id,
      percentagePerData
    };

    await createWorkers(workerPath, workerData, results);

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
