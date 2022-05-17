import * as mongoose from 'mongoose';
import { ImportHistory } from '../db/models';

import { connect } from './utils';
import * as _ from 'underscore';
import messageBroker from '../messageBroker';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

let cancel = false;

parentPort.once('message', message => {
  if (message === 'cancel') {
    parentPort.postMessage('Cancelled');
    cancel = true;
  }
});

const create = async ({
  subdomain,
  docs,
  user,
  contentType,
  useElkSyncer
}: {
  subdomain: string;
  docs: any;
  user: any;
  contentType: any;
  useElkSyncer: any;
}) => {
  console.log('Importing  data');

  const [serviceName, type] = contentType.split(':');

  const result = await await messageBroker().sendRPCMessage(
    `${serviceName}:imports:insertImportItems`,
    {
      subdomain,
      data: {
        docs,
        user,
        contentType: type,
        useElkSyncer
      }
    }
  );

  const { objects, updated, error } = result;

  if (error) {
    throw new Error(error);
  }

  return { objects, updated };
};

connect().then(async () => {
  if (cancel) {
    return;
  }

  console.log(`Worker message recieved`);

  const {
    subdomain,
    user,
    scopeBrandIds,
    result,
    contentType,
    properties,
    importHistoryId,
    percentage,
    useElkSyncer,
    rowIndex
  }: {
    subdomain: string;
    user: any;
    scopeBrandIds: string[];
    result: any;
    contentType: string;
    properties: Array<{ [key: string]: string }>;
    importHistoryId: string;
    percentage: number;
    useElkSyncer: boolean;
    rowIndex?: number;
  } = workerData;

  const [serviceName, type] = contentType.split(':');

  // tslint:disable-next-line:no-eval

  const bulkDoc = await messageBroker().sendRPCMessage(
    `${serviceName}:imports:prepareImportDocs`,
    {
      subdomain,
      data: {
        result,
        properties,
        contentType: type,
        user,
        scopeBrandIds,
        useElkSyncer
      }
    }
  );

  const modifier: { $inc?; $push? } = {
    $inc: { percentage }
  };

  try {
    const { updated, objects } = await create({
      subdomain,
      docs: bulkDoc,
      user,
      contentType,
      useElkSyncer
    });

    const cocIds = objects.map(obj => obj._id).filter(obj => obj);

    modifier.$push = { ids: cocIds };
    modifier.$inc.updated = updated;
    modifier.$inc.success = bulkDoc.length;
  } catch (e) {
    let startRow = 1;
    let endRow = bulkDoc.length;

    if (rowIndex && rowIndex > 1) {
      startRow = rowIndex * bulkDoc.length - bulkDoc.length;
      endRow = rowIndex * bulkDoc.length;
    }

    const distance = endRow - startRow;

    if (distance === 1) {
      endRow = startRow;
    }

    modifier.$push = { errorMsgs: e.message };
    modifier.$inc.failed = bulkDoc.length;
    modifier.$push = {
      errorMsgs: {
        startRow,
        endRow,
        errorMsgs: e.message,
        contentType
      }
    };
  }

  await ImportHistory.updateOne({ _id: importHistoryId }, modifier);

  mongoose.connection.close();

  console.log(`Worker done`);

  parentPort.postMessage({
    action: 'remove',
    message: 'Successfully finished the job'
  });
});
