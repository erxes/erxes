import * as mongoose from 'mongoose';
import {
  removeCompanies,
  removeCustomers,
  removeDeals,
  removeTasks,
  removeTickets,
  removePurchases
} from '../../messageBroker';

import { connect } from '../utils';
import { removeProducts } from '../../messageBroker';

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
      case 'customer':
        await removeCustomers(subdomain, result);
        break;
      case 'lead':
        await removeCustomers(subdomain, result);
        break;

      case 'deal':
        await removeDeals(subdomain, result);
        break;
      case 'purchase':
        await removePurchases(subdomain, result);
        break;
      case 'task':
        await removeTasks(subdomain, result);
        break;
      case 'ticket':
        await removeTickets(subdomain, result);
        break;
      case 'product':
        await removeProducts(subdomain, result);
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
