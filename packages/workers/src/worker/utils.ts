import * as csvParser from 'csv-parser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as path from 'path';
import * as readline from 'readline';
import { Writable } from 'stream';
import { createAWS, getS3FileInfo, uploadsFolderPath } from '../data/utils';
import { default as ImportHistory } from '../db/models/ImportHistory';

import CustomWorker from './workerUtil';
import * as streamify from 'stream-array';
import * as os from 'os';
import { debugWorkers } from './debugger';
import { getFileUploadConfigs, initBroker } from '../messageBroker';
import { redis } from '../serviceDiscovery';

const { MONGO_URL = '', ELK_SYNCER } = process.env;

const checkFieldNames = async (fields: string[], columnConfig?: object) => {
  const properties: any[] = [];

  for (let fieldName of fields) {
    if (!fieldName) {
      continue;
    }

    fieldName = fieldName.trim();

    const property: { [key: string]: any } = {};

    if (columnConfig) {
      fieldName = columnConfig[fieldName].value;
    }

    if (columnConfig) {
      if (columnConfig[fieldName]) {
        fieldName = columnConfig[fieldName].value;
      }
    }

    property.name = fieldName;
    property.type = 'basic';

    if (fieldName.includes('customFieldsData')) {
      const fieldId = fieldName.split('.')[1];

      property.type = 'customProperty';
      property.id = fieldId;
    }

    if (fieldName === 'companiesPrimaryNames') {
      property.name = 'companyIds';
      property.type = 'companiesPrimaryNames';
    }

    if (fieldName === 'customersPrimaryEmails') {
      property.name = 'customerIds';
      property.type = 'customersPrimaryEmails';
    }

    if (fieldName === 'ownerEmail') {
      property.name = 'ownerId';
      property.type = 'ownerEmail';
    }

    if (fieldName === 'tag') {
      property.name = 'tagIds';
      property.type = 'tag';
    }

    if (fieldName === 'assignedUserEmail') {
      property.name = 'assignedUserIds';
      property.type = 'assignedUserEmail';
    }

    if (fieldName === 'boardName') {
      property.name = 'boardId';
      property.type = 'boardName';
    }

    if (fieldName === 'pipelineName') {
      property.name = 'pipelineId';
      property.type = 'pipelineName';
    }

    if (fieldName === 'stageName') {
      property.name = 'stageId';
      property.type = 'stageName';
    }

    if (fieldName === 'pronoun') {
      property.name = 'pronoun';
      property.type = 'pronoun';
    }

    if (fieldName === 'categoryCode') {
      property.name = 'categoryCode';
      property.type = 'categoryCode';
    }

    if (fieldName === 'vendorCode') {
      property.name = 'vendorCode';
      property.type = 'vendorCode';
    }

    properties.push(property);
  }

  return properties;
};

export const connect = async () => {
  const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX } = process.env;

  await initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }).catch(e => {
    console.log(`Error ocurred during message broker init ${e.message}`);
  });

  return mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
  });
};

dotenv.config();

const WORKER_BULK_LIMIT = 300;

const myWorker = new CustomWorker();

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

        resolve({ rows: total, columns });
      });
    } else {
      const { AWS_BUCKET } = await getFileUploadConfigs();
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

      return resolve({ rows: total, columns });
    }
  });
};

const importBulkStream = ({
  contentType,
  fileName,
  bulkLimit,
  uploadType,
  handleBulkOperation,
  associateContentType,
  associateField,
  mainAssociateField
}: {
  contentType: string;
  fileName: string;
  bulkLimit: number;
  uploadType: 'AWS' | 'local';
  handleBulkOperation: (
    rowIndex: number,
    rows: any,
    contentType: string,
    associatedContentType?: string,
    associatedField?: string,
    mainAssociateField?: string
  ) => Promise<void>;
  associateContentType?: string;
  associateField?: string;
  mainAssociateField?: string;
}) => {
  return new Promise(async (resolve, reject) => {
    let rows: any = [];
    let readSteam;
    let rowIndex = 0;

    if (uploadType === 'AWS') {
      const { AWS_BUCKET } = await getFileUploadConfigs();

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
      rowIndex++;
      rows.push(row);

      if (rows.length === bulkLimit) {
        return handleBulkOperation(
          rowIndex,
          rows,
          contentType,
          associateContentType,
          associateField,
          mainAssociateField
        )
          .then(() => {
            rows = [];
            next();
          })
          .catch(e => {
            debugWorkers(`Error during bulk insert from csv: ${e.message}`);
            reject(e);
          });
      }

      return next();
    };

    readSteam
      .pipe(csvParser())
      .pipe(new Writable({ write, objectMode: true }))
      .on('finish', () => {
        rowIndex++;
        handleBulkOperation(
          rowIndex,
          rows,
          contentType,
          associateContentType,
          associateField,
          mainAssociateField
        ).then(() => {
          resolve('success');
        });
      })
      .on('error', e => reject(e));
  });
};

const getWorkerFile = fileName => {
  if (process.env.NODE_ENV !== 'production') {
    return `./src/worker/${fileName}.worker.import.js`;
  }

  return `./dist/workers/src/worker/${fileName}.worker.import.js`;
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
      debugWorkers(`Remove import ended`);
    };

    myWorker.setHandleEnd(handleOnEndWorker);

    const importHistory = await ImportHistory.getImportHistory(importHistoryId);

    const ids = importHistory.ids || [];

    if (ids.length === 0) {
      return { status: 'ok' };
    }

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
    debugWorkers(`Failed to remove import: ${e.message}`);
    throw e;
  }
};

export const receiveImportCancel = () => {
  myWorker.removeWorkers();

  return { status: 'ok' };
};

export const receiveImportCreate = async (content: any) => {
  const {
    contentTypes,
    files,
    scopeBrandIds,
    user,
    uploadType,
    columnsConfig,
    importHistoryId,
    associatedContentType
  } = content;

  const useElkSyncer = ELK_SYNCER === 'false' ? false : true;

  const config: any = {};

  let total = 0;

  let mainType = contentTypes[0].contentType;
  const serviceType = contentTypes[0].serviceType;

  if (associatedContentType) {
    mainType = associatedContentType;
  }

  for (const contentType of contentTypes) {
    const file = files[contentType.contentType];
    const columnConfig = columnsConfig[contentType.contentType];
    const fileName = file[0].url;

    const { rows, columns }: any = await getCsvInfo(fileName, uploadType);

    if (rows === 0) {
      throw new Error('Please import at least one row of data');
    }

    total = total + rows;

    const updatedColumns = (columns || '').replace(/\n|\r/g, '').split(',');

    const properties = await checkFieldNames(updatedColumns, columnConfig);

    config[contentType.contentType] = { total: rows, properties, fileName };
  }

  debugWorkers(config);

  await ImportHistory.updateOne(
    { _id: importHistoryId },
    {
      contentTypes,
      userId: user._id,
      date: Date.now(),
      total
    }
  );

  const updateImportHistory = async doc => {
    return ImportHistory.updateOne({ _id: importHistoryId }, doc);
  };

  const handleOnEndBulkOperation = async () => {
    const updatedImportHistory = await ImportHistory.findOne({
      _id: importHistoryId
    });

    let status = 'inProgress';

    if (!updatedImportHistory) {
      throw new Error('Import history not found');
    }

    if (
      updatedImportHistory.failed + updatedImportHistory.success ===
      updatedImportHistory.total
    ) {
      status = 'Done';
      await updateImportHistory({
        $set: { status, percentage: 100 }
      });

      // const notifDoc: ISendNotification = {
      //   title: `your ${updatedImportHistory.name} is done`,
      //   action: ``,
      //   createdUser: ``,
      //   receivers: [user._id],
      //   content: `your ${updatedImportHistory.name} import is done`,
      //   link: `/settings/importHistories?${mainType}`,
      //   notifType: NOTIFICATION_TYPES.IMPORT_DONE,
      //   contentType: 'import',
      //   contentTypeId: importHistoryId
      // };

      // await utils.sendNotification(notifDoc);
    }

    debugWorkers(`Import create ended`);
  };

  const handleBulkOperation = async (
    rowIndex: number,
    rows: any,
    contentType: string
  ) => {
    if (rows.length === 0) {
      return debugWorkers('Please import at least one row of data');
    }

    const result: unknown[] = [];

    for (const row of rows) {
      result.push(Object.values(row));
    }

    const workerPath = path.resolve(getWorkerFile('bulkInsert'));

    await myWorker.createWorker(workerPath, {
      rowIndex,
      scopeBrandIds,
      user,
      contentType,
      serviceType,
      properties: config[contentType].properties,
      importHistoryId,
      result,
      useElkSyncer,
      percentage: Number(((result.length / total) * 100).toFixed(3))
    });
  };

  myWorker.setHandleEnd(handleOnEndBulkOperation);

  importBulkStream({
    contentType: mainType,
    fileName: config[mainType].fileName,
    uploadType,
    bulkLimit: WORKER_BULK_LIMIT,
    handleBulkOperation
  });

  return { id: importHistoryId };
};

const importWebhookStream = ({
  data,
  bulkLimit,
  handleBulkOperation
}: {
  data: any[];
  bulkLimit: number;
  handleBulkOperation: (rows: any) => Promise<void>;
}) => {
  return new Promise(async (resolve, reject) => {
    let rows: any = [];

    const write = (row, _, next) => {
      rows.push(row);

      if (rows.length === bulkLimit) {
        return handleBulkOperation(rows)
          .then(() => {
            rows = [];
            next();
          })
          .catch(e => {
            debugWorkers(`Error during bulk insert from webhook: ${e.message}`);
            reject(e);
          });
      }

      return next();
    };

    streamify(data, os.EOL)
      .pipe(new Writable({ write, objectMode: true }))
      .on('finish', () => {
        handleBulkOperation(rows).then(() => {
          resolve('success');
        });
      })
      .on('error', e => reject(e));
  });
};

export const importFromWebhook = async (content: any) => {
  const { data, type } = content;

  const useElkSyncer = ELK_SYNCER === 'false' ? false : true;

  if (data.length === 0) {
    throw new Error('Please import at least one row of data');
  }

  const properties = await checkFieldNames(type, Object.keys(data[0]));

  const handleBulkOperation = async (rows: any) => {
    if (rows.length === 0) {
      return debugWorkers('Please import at least one row of data');
    }

    const result: any[] = [];

    for (const row of rows) {
      result.push(Object.values(row));
    }

    const workerPath = path.resolve(getWorkerFile('bulkInsert'));

    await myWorker.createWorker(workerPath, {
      contentType: type,
      properties,
      result,
      useElkSyncer,
      percentage: 0
    });
  };

  importWebhookStream({
    data,
    bulkLimit: WORKER_BULK_LIMIT,
    handleBulkOperation
  });
};
