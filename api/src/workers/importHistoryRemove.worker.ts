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

    const historyObj = await ImportHistory.findOne({ _id: importHistoryId });

    if (historyObj && (historyObj.ids || []).length === 0) {
      await ImportHistory.deleteOne({ _id: importHistoryId });
    }

    mongoose.connection.close();

    parentPort.postMessage('Successfully finished job');
  })
  .catch(e => {
    mongoose.connection.close();

    parentPort.postMessage(`Finished job with error ${e.message}`);
  });
