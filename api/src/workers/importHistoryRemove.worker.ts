import * as mongoose from 'mongoose';
import {
  Companies,
  Customers,
  Deals,
  ImportHistory,
  Products,
  Tasks,
  Tickets
} from '../db/models';
import { connect } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect()
  .then(async () => {
    const { result, contentType, importHistoryId } = workerData;

    switch (contentType) {
      case 'company':
        await Companies.removeCompanies(result);
        break;
      case 'customer':
        await Customers.removeCustomers(result);
        break;
      case 'lead':
        await Customers.removeCustomers(result);
        break;
      case 'product':
        await Products.removeProducts(result);
        break;
      case 'deal':
        await Deals.removeDeals(result);
        break;
      case 'task':
        await Tasks.removeTasks(result);
        break;
      case 'ticket':
        await Tickets.removeTickets(result);
        break;
      default:
        break;
    }

    await ImportHistory.updateOne(
      { _id: importHistoryId },
      { $pull: { ids: { $in: result } } }
    );

    const importHistory = await ImportHistory.findOne({
      _id: importHistoryId
    }).lean();

    if (importHistory && (importHistory.ids || []).length === 0) {
      await ImportHistory.updateOne(
        { _id: importHistoryId },
        { $set: { status: 'Removed' } }
      );
    }

    mongoose.connection.close();

    parentPort.postMessage({
      action: 'remove',
      message: 'Successfully finished the job'
    });
  })
  .catch(e => {
    mongoose.connection.close();

    parentPort.postMessage();

    parentPort.postMessage({
      action: 'remove',
      message: `Finished job with error ${e.message}`
    });
  });
