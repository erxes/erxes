import { initBroker } from '../../messageBroker';
import { IModels } from '../../connectionResolvers';
import { redis } from '../../serviceDiscovery';
import * as mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';

import CustomWorker from '../workerUtil';
import { debugWorkers } from '../debugger';

dotenv.config();

const myWorker = new CustomWorker();

const getWorkerFile = () => {
  if (process.env.NODE_ENV !== 'production') {
    return `./src/worker/exportHistory/export.worker.js`;
  }

  return `./dist/workers/src/worker/exportHistory/export.worker.js`;
};

export const receiveExportCreate = async (
  content: any,
  models: IModels,
  subdomain: string
) => {
  const { contentType, columnsConfig, exportHistoryId } = content;

  debugWorkers(`Export called`);

  const handleOnEndWorker = async () => {
    debugWorkers(`Export import ended`);
  };

  myWorker.setHandleEnd(handleOnEndWorker);

  const workerPath = path.resolve(getWorkerFile());
  try {
    await myWorker.createWorker(subdomain, workerPath, {
      contentType,
      exportHistoryId,
      columnsConfig
    });
  } catch (e) {
    await models.ExportHistory.update(
      { _id: exportHistoryId },
      { error: e.message }
    );
  }
  return { id: exportHistoryId };
};

export const connect = async () => {
  const { RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, MONGO_URL = '' } = process.env;

  await initBroker({ RABBITMQ_HOST, MESSAGE_BROKER_PREFIX, redis }).catch(e => {
    console.log(`Error ocurred during message broker init ${e.message}`);
  });

  return mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
  });
};
