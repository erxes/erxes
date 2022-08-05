import * as mongoose from 'mongoose';
import {
  Companies,
  Customers,
  Deals,
  Products,
  Tasks,
  Tickets
} from '../db/models';
import { connect } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect()
  .then(async () => {
    const { result, contentType } = workerData;

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

    mongoose.connection.close();

    parentPort.postMessage({
      action: 'remove',
      message: 'Successfully finished the job'
    });
  })
  .catch(e => {
    mongoose.connection.close();

    parentPort.postMessage({
      action: 'remove',
      message: `Finished job with error ${e.message}`
    });
  });
