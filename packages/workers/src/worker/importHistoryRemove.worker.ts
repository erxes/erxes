import * as mongoose from 'mongoose';
import { removeCompanies } from '../messageBroker';

import { connect } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

connect()
  .then(async () => {
    const { result, contentType, subdomain } = workerData;

    const type = contentType.split(':')[1];

    switch (type) {
      case 'company':
        await removeCompanies(subdomain, result);
        break;
      // case 'customer':
      //   await Customers.removeCustomers(result);
      //   break;
      // case 'lead':
      //   await Customers.removeCustomers(result);
      //   break;
      // case 'product':
      //   await Products.removeProducts(result);
      //   break;
      // case 'deal':
      //   await Deals.removeDeals(result);
      //   break;
      // case 'task':
      //   await Tasks.removeTasks(result);
      //   break;
      // case 'ticket':
      //   await Tickets.removeTickets(result);
      //   break;
      default:
        break;
    }

    console.log(result, contentType);

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
