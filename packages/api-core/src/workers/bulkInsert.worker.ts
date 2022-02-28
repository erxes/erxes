import * as mongoose from 'mongoose';
import { ImportHistory } from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';
import { debugWorkers } from '../debuggers';
import { connect } from './utils';
import * as _ from 'underscore';

import messageBroker from './messageBroker';

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
  docs,
  user,
  contentType,
  useElkSyncer,
  serviceType
}: {
  docs: any;
  user: any;
  contentType: any;
  useElkSyncer: any;
  serviceType: any;
}) => {
  debugWorkers('Importing  data');

  const result = await await messageBroker().sendRPCMessage(
    `${serviceType}:rpc_queue:insertImportItems`,
    {
      docs,
      user,
      contentType,
      useElkSyncer
    }
  );

  console.log(result);

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

  debugWorkers(`Worker message recieved`);

  const {
    user,
    scopeBrandIds,
    result,
    contentType,
    serviceType,
    properties,
    importHistoryId,
    percentage,
    useElkSyncer,
    rowIndex
  }: {
    user: IUserDocument;
    scopeBrandIds: string[];
    result: any;
    contentType: string;
    serviceType: string;
    properties: Array<{ [key: string]: string }>;
    importHistoryId: string;
    percentage: number;
    useElkSyncer: boolean;
    rowIndex?: number;
  } = workerData;

  // tslint:disable-next-line:no-eval

  const bulkDoc = await messageBroker().sendRPCMessage(
    `${serviceType}:rpc_queue:prepareImportDocs`,
    {
      result,
      properties,
      contentType,
      user,
      scopeBrandIds,
      useElkSyncer
    }
  );

  const modifier: { $inc?; $push? } = {
    $inc: { percentage }
  };

  try {
    const { updated, objects } = await create({
      docs: bulkDoc,
      user,
      contentType,
      useElkSyncer,
      serviceType
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

  debugWorkers(`Worker done`);

  parentPort.postMessage({
    action: 'remove',
    message: 'Successfully finished the job'
  });
});
