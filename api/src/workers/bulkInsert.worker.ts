import * as mongoose from 'mongoose';
import { PLUGINS } from './constants';
import { ImportHistory } from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';
import { debugWorkers } from '../debuggers';
import { connect } from './utils';
import * as _ from 'underscore';
import { prepareCoreDocs } from './coreUtils';
import { MongoClient } from 'mongodb';

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
  db,
  importType,
  plugin
}: {
  docs: any;
  user: IUserDocument;
  contentType: string;
  useElkSyncer: boolean;
  db: any;
  importType: string;
  plugin: any;
}) => {
  let objects;
  const updated = 0;

  if (importType === 'plugin') {
    debugWorkers('Importin plugin data');
    const result = await db.collection(plugin.collection).insertMany(docs);

    objects = result.ops;
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
    type,
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
    type: string;
    serviceType: string;
    properties: Array<{ [key: string]: string }>;
    importHistoryId: string;
    percentage: number;
    useElkSyncer: boolean;
    rowIndex?: number;
  } = workerData;

  let bulkDoc: any = [];

  let db: any;
  let plugin: any;
  let client: any;

  if (type === 'core') {
    bulkDoc = await prepareCoreDocs(
      result,
      properties,
      contentType,
      scopeBrandIds,
      bulkDoc
    );
  }

  if (type === 'plugin') {
    plugin = PLUGINS.find(value => {
      return value.serviceType === serviceType;
    });

    if (plugin) {
      try {
        client = new MongoClient(plugin.MONGO_URL);
        await client.connect();
        db = client.db();

        // tslint:disable-next-line:no-eval
        eval(plugin.prepareDocCommand);
      } catch (e) {
        debugWorkers(e);
      }
    }
  }
  const modifier: { $inc?; $push? } = {
    $inc: { percentage }
  };

  try {
    const { updated, objects } = await create({
      docs: bulkDoc,
      user,
      contentType,
      useElkSyncer,
      db,
      plugin,
      importType: type
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

  if (client) {
    await client.close();
  }

  debugWorkers(`Worker done`);

  parentPort.postMessage({
    action: 'remove',
    message: 'Successfully finished the job'
  });
});
