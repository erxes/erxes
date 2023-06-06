import { IModels } from '../../connectionResolvers';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import CustomWorker from '../workerUtil';
import { debugWorkers } from '../debugger';

dotenv.config();

const myWorker = new CustomWorker();

export const uploadsFolderPath = path.join(__dirname, '../../private/uploads');

const getWorkerFile = () => {
  if (process.env.NODE_ENV !== 'production') {
    return `./src/worker/export/export.worker.js`;
  }

  return `./dist/workers/src/worker/export/export.worker.js`;
};

export const receiveExportCreate = async (
  content: any,
  models: IModels,
  subdomain: string
) => {
  const {
    contentType,
    user,
    columnsConfig,
    exportHistoryId,
    segmentData
  } = content;

  debugWorkers(`Export called`);

  const handleOnEndWorker = async () => {
    debugWorkers(`Export ended`);
  };

  myWorker.setHandleEnd(handleOnEndWorker);

  const workerPath = path.resolve(getWorkerFile());

  try {
    myWorker.createWorker(subdomain, workerPath, {
      contentType,
      exportHistoryId,
      columnsConfig,
      segmentData,
      user,
      subdomain
    });
  } catch (e) {
    await models.ExportHistory.update(
      { _id: exportHistoryId },
      { error: e.message }
    );
  }
  return { id: exportHistoryId };
};

/**
 * Read file from Local
 */
export const readFileRequest = async ({
  key
}: {
  key: string;
}): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(`${uploadsFolderPath}/${key}`, (error, response) => {
      if (error) {
        return reject(error);
      }

      return resolve(response);
    });
  });
};
