import * as csvParser from 'csv-parser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as readline from 'readline';
import { Writable } from 'stream';
import { checkFieldNames } from '../data/modules/fields/utils';
import {
  createAWS,
  deleteFile,
  getConfig,
  uploadsFolderPath
} from '../data/utils';
import { CUSTOMER_SELECT_OPTIONS } from '../db/models/definitions/constants';
import {
  default as ImportHistories,
  default as ImportHistory
} from '../db/models/ImportHistory';
import { debugWorkers } from '../debuggers';
import CustomWorker from './workerUtil';

const { MONGO_URL = '', ELK_SYNCER } = process.env;

export const connect = () =>
  mongoose.connect(MONGO_URL, { useNewUrlParser: true, useCreateIndex: true });

dotenv.config();

const WORKER_BULK_LIMIT = 1000;

const myWorker = new CustomWorker();

export const IMPORT_CONTENT_TYPE = {
  CUSTOMER: 'customer',
  COMPANY: 'company',
  LEAD: 'lead',
  PRODUCT: 'product',
  DEAL: 'deal',
  TASK: 'task',
  TICKET: 'ticket'
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

const getS3FileInfo = async ({ s3, query, params }): Promise<string> => {
  return new Promise(resolve => {
    s3.selectObjectContent(
      {
        ...params,
        ExpressionType: 'SQL',
        Expression: query,
        InputSerialization: {
          CSV: {
            FileHeaderInfo: 'None',
            RecordDelimiter: '\n',
            FieldDelimiter: ','
          }
        },
        OutputSerialization: {
          CSV: {}
        }
      },
      (_, data) => {
        // data.Payload is a Readable Stream
        const eventStream: any = data.Payload;

        let result;

        // Read events as they are available
        eventStream.on('data', event => {
          if (event.Records) {
            result = event.Records.Payload.toString();
          }
        });
        eventStream.on('end', () => {
          resolve(result);
        });
      }
    );
  });
};

const getCsvInfo = (fileName: string, uploadType: string) => {
  return new Promise(async resolve => {
    if (uploadType === 'local') {
      const readSteam = fs.createReadStream(`${uploadsFolderPath}/${fileName}`);

      let columns;
      let total = 0;

      const rl = readline.createInterface({
        input: readSteam,
        terminal: false
      });

      rl.on('line', input => {
        if (total === 0) {
          columns = input;
        }

        total++;
      });
      rl.on('close', () => {
        // exclude column
        total--;

        debugWorkers(`Get CSV Info type: local, totalRow: ${total}`);

        resolve({ total, columns });
      });
    } else {
      const AWS_BUCKET = await getConfig('AWS_BUCKET');
      const s3 = await createAWS();

      const params = { Bucket: AWS_BUCKET, Key: fileName };

      const rowCountString = await getS3FileInfo({
        s3,
        params,
        query: 'SELECT COUNT(*) FROM S3Object'
      });

      // exclude column
      let total = Number(rowCountString);

      total--;

      const columns = await getS3FileInfo({
        s3,
        params,
        query: 'SELECT * FROM S3Object LIMIT 1'
      });

      debugWorkers(`Get CSV Info type: AWS, totalRow: ${total}`);

      return resolve({ total, columns });
    }
  });
};

const importBulkStream = ({
  fileName,
  bulkLimit,
  uploadType,
  handleBulkOperation
}: {
  fileName: string;
  bulkLimit: number;
  uploadType: 'AWS' | 'local';
  handleBulkOperation: (rows: any) => Promise<void>;
}) => {
  return new Promise(async (resolve, reject) => {
    let rows: any = [];
    let readSteam;

    if (uploadType === 'AWS') {
      const AWS_BUCKET = await getConfig('AWS_BUCKET');

      const s3 = await createAWS();

      const errorCallback = error => {
        throw new Error(error.code);
      };

      const params = { Bucket: AWS_BUCKET, Key: fileName };

      readSteam = s3.getObject(params).createReadStream();
      readSteam.on('error', errorCallback);
    } else {
      readSteam = fs.createReadStream(`${uploadsFolderPath}/${fileName}`);
    }

    const write = (row, _, next) => {
      rows.push(row);

      if (rows.length === bulkLimit) {
        return handleBulkOperation(rows)
          .then(() => {
            rows = [];
            next();
          })
          .catch(e => reject(e));
      }

      return next();
    };

    readSteam
      .pipe(csvParser())
      .pipe(new Writable({ write, objectMode: true }))
      .on('finish', () => {
        handleBulkOperation(rows).then(() => {
          resolve('success');
        });
      })
      .on('error', e => reject(e));
  });
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

// csv file import, cancel, removal
export const receiveImportRemove = async (content: any) => {
  try {
    debugWorkers(`Remove import called`);

    const { contentType, importHistoryId } = content;

    const handleOnEndWorker = async () => {
      const updatedImportHistory = await ImportHistory.findOne({
        _id: importHistoryId
      });

      if (updatedImportHistory && updatedImportHistory.status === 'Removed') {
        await ImportHistory.deleteOne({ _id: importHistoryId });
      }

      debugWorkers(`Remove import ended`);
    };

    myWorker.setHandleEnd(handleOnEndWorker);

    const importHistory = await ImportHistories.getImportHistory(
      importHistoryId
    );

    const ids = importHistory.ids || [];

    const workerPath = path.resolve(getWorkerFile('importHistoryRemove'));

    const calc = Math.ceil(ids.length / WORKER_BULK_LIMIT);
    const results: any[] = [];

    for (let index = 0; index < calc; index++) {
      const start = index * WORKER_BULK_LIMIT;
      const end = start + WORKER_BULK_LIMIT;
      const row = ids.slice(start, end);

      results.push(row);
    }

    for (const result of results) {
      await myWorker.createWorker(workerPath, {
        contentType,
        importHistoryId,
        result
      });
    }

    return { status: 'ok' };
  } catch (e) {
    debugWorkers('Failed to remove import: ', e.message);
    throw e;
  }
};

export const receiveImportCancel = () => {
  myWorker.removeWorkers();

  return { status: 'ok' };
};

export const receiveImportCreate = async (content: any) => {
  const { fileName, type, scopeBrandIds, user, uploadType, fileType } = content;

  debugWorkers(`Import created called`);

  let importHistory;

  const useElkSyncer = ELK_SYNCER === 'true';

  if (fileType !== 'csv') {
    throw new Error('Invalid file type');
  }

  const { total, columns }: any = await getCsvInfo(fileName, uploadType);

  const updatedColumns = (columns || '').replace(/\n|\r/g, '').split(',');

  const properties = await checkFieldNames(type, updatedColumns);

  importHistory = await ImportHistory.create({
    contentType: type,
    userId: user._id,
    date: Date.now(),
    total
  });

  const updateImportHistory = async doc => {
    return ImportHistory.updateOne({ _id: importHistory.id }, doc);
  };

  const handleOnEndBulkOperation = async () => {
    const updatedImportHistory = await ImportHistory.findOne({
      _id: importHistory.id
    });

    if (!updatedImportHistory) {
      throw new Error('Import history not found');
    }

    if (
      updatedImportHistory.failed + updatedImportHistory.success ===
      updatedImportHistory.total
    ) {
      await updateImportHistory({
        $set: { status: 'Done', percentage: 100 }
      });
    }

    await deleteFile(fileName);

    debugWorkers(`Import create ended`);
  };

  const handleBulkOperation = async (rows: any) => {
    if (rows.length === 0) {
      return debugWorkers('Please import at least one row of data');
    }

    const result: unknown[] = [];

    for (const row of rows) {
      result.push(Object.values(row));
    }

    const workerPath = path.resolve(getWorkerFile('bulkInsert'));

    await myWorker.createWorker(workerPath, {
      scopeBrandIds,
      user,
      contentType: type,
      properties,
      importHistoryId: importHistory._id,
      result,
      useElkSyncer,
      percentage: Number(((result.length / total) * 100).toFixed(3))
    });
  };

  myWorker.setHandleEnd(handleOnEndBulkOperation);

  importBulkStream({
    fileName,
    uploadType,
    bulkLimit: WORKER_BULK_LIMIT,
    handleBulkOperation
  });

  return { id: importHistory.id };
};
