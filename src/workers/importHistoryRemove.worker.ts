import * as mongoose from 'mongoose';
import { Companies, Customers, ImportHistory } from '../db/models';
import { graphqlPubsub } from '../pubsub';
import { connect } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect().then(async () => {
  const { result, contentType, importHistoryId } = workerData;

  let collection: any = Companies;

  if (contentType === 'customer') {
    collection = Customers;
  }

  await collection.deleteMany({ _id: { $in: result } });
  await ImportHistory.updateOne({ _id: importHistoryId }, { $pull: { ids: { $in: result } } });

  const historyObj = await ImportHistory.findOne({ _id: importHistoryId });

  if (historyObj && (historyObj.ids || []).length === 0) {
    graphqlPubsub.publish('importHistoryChanged', {
      importHistoryChanged: {
        _id: historyObj._id,
        status: 'Removed',
        percentage: 100,
      },
    });

    await ImportHistory.deleteOne({ _id: importHistoryId });
  }

  mongoose.connection.close();

  parentPort.postMessage('Successfully finished job');
});
