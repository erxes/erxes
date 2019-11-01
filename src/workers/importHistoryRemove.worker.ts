import * as mongoose from 'mongoose';
import { Companies, Customers, ImportHistory, Products } from '../db/models';
import { graphqlPubsub } from '../pubsub';
import { connect } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect()
  .then(async () => {
    const { result, contentType, importHistoryId } = workerData;

    if (contentType === 'company') {
      await Companies.removeCompanies(result);
    }

    if (contentType === 'customer') {
      await Customers.removeCustomers(result);
    }

    if (contentType === 'product') {
      await Products.removeProducts(result);
    }

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
  })
  .catch(e => {
    const { importHistoryId } = workerData;

    graphqlPubsub.publish('importHistoryChanged', {
      importHistoryChanged: {
        _id: importHistoryId,
        status: 'Error',
        errorMsgs: [e.message],
      },
    });

    mongoose.connection.close();

    parentPort.postMessage('Finished job with error');
  });
