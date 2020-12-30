import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as mongoose from 'mongoose';
import * as path from 'path';
import { checkFieldNames } from '../data/modules/fields/utils';
import { deleteFile, importBulkStream } from '../data/utils';
import { Companies, Customers } from '../db/models';
import { CUSTOMER_SELECT_OPTIONS } from '../db/models/definitions/constants';
import {
  default as ImportHistories,
  default as ImportHistory
} from '../db/models/ImportHistory';
import { debugWorkers } from '../debuggers';
import CustomWorker from './workerUtil';

const { MONGO_URL = '' } = process.env;

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
    const { contentType, importHistoryId } = content;

    const handleOnEndWorker = async () => {
      const updatedImportHistory = await ImportHistory.findOne({
        _id: importHistoryId
      });

      if (updatedImportHistory && updatedImportHistory.status === 'Removed') {
        await ImportHistory.deleteOne({ _id: importHistoryId });
      }
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
    let validationValues;
    let importHistory;

    if (fileType !== 'csv') {
      throw new Error('Invalid file type');
    }

    const updateImportHistory = async doc => {
      return ImportHistory.updateOne({ _id: importHistory.id }, doc);
    };

    const updateValidationValues = async () => {
      validationValues = await beforeImport(type);
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
    };

    importHistory = await ImportHistory.create({
      contentType: type,
      userId: user._id,
      date: Date.now()
    });

    myWorker.setHandleEnd(handleOnEndBulkOperation);

    // collect initial validation values
    await updateValidationValues();

    const isRowValid = (row: any) => {
      const errors: Error[] = [];

      const { LEAD, CUSTOMER, COMPANY } = IMPORT_CONTENT_TYPE;

      const {
        existingCodes,
        existingEmails,
        existingPhones,
        existingNames
      } = validationValues;

      if (type === CUSTOMER || type === LEAD) {
        const { primaryEmail, primaryPhone, code } = row;

        if (existingCodes.includes(code)) {
          errors.push(new Error(`Duplicated code: ${code}`));
        }

        if (existingEmails.includes(primaryEmail)) {
          errors.push(new Error(`Duplicated email: ${primaryEmail}`));
        }

        if (existingPhones.includes(primaryPhone)) {
          errors.push(new Error(`Duplicated phone: ${primaryPhone}`));
        }

        return errors;
      }

      if (type === COMPANY) {
        const { primaryName, code } = row;

        if (existingNames.includes(primaryName)) {
          errors.push(new Error(`Duplicated name: ${primaryName}`));
        }

        if (existingCodes.includes(code)) {
          errors.push(new Error(`Duplicated code: ${code}`));
        }

        return errors;
      }

      return errors;
    };

    const handleBulkOperation = async (rows: any, totalRows: number) => {
      let errorMsgs: Error[] = [];

      if (!importHistory.total) {
        await updateImportHistory({
          $set: { total: totalRows }
        });
      }

      if (rows.length === 0) {
        debugWorkers('Please import at least one row of data');
      }

      if (!fieldNames) {
        const [fields] = rows;

        fieldNames = Object.keys(fields);
        properties = await checkFieldNames(type, fieldNames);
      }

      const result: unknown[] = [];

      for (const row of rows) {
        const errors = isRowValid(row);

        errors.length > 0
          ? errorMsgs.push(...errors)
          : result.push(Object.values(row));
      }

      const workerPath = path.resolve(getWorkerFile('bulkInsert'));

      await myWorker.createWorker(workerPath, {
        scopeBrandIds,
        user,
        contentType: type,
        properties,
        importHistoryId: importHistory._id,
        result,
        percentage: Number(((result.length / totalRows) * 100).toFixed(3))
      });

      await updateImportHistory({
        $inc: { failed: errorMsgs.length },
        $push: { errorMsgs }
      });
      await updateValidationValues();

      errorMsgs = [];
    };

    importBulkStream({
      fileName,
      uploadType,
      bulkLimit: WORKER_BULK_LIMIT,
      handleBulkOperation
    });

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
