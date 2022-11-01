import { IModels } from '../../connectionResolvers';
import * as dotenv from 'dotenv';
import * as path from 'path';

import CustomWorker from '../workerUtil';
import { debugWorkers } from '../debugger';

dotenv.config();

const myWorker = new CustomWorker();

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
    await myWorker.createWorker(subdomain, workerPath, {
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
