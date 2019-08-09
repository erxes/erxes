import * as mongoose from 'mongoose';
import { Companies, Customers, ImportHistory } from '../db/models';
import { graphqlPubsub } from '../pubsub';
import { connect } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

let cancel = false;

parentPort.once('message', message => {
  if (message === 'cancel') {
    parentPort.postMessage('Cancelled');
    cancel = true;
  }
});

connect().then(async () => {
  if (cancel) {
    return;
  }

  const { user, scopeBrandIds, result, contentType, properties, importHistoryId, percentagePerData } = workerData;

  let percentage = '0';
  let create: any = Customers.createCustomer;

  if (contentType === 'company') {
    create = Companies.createCompany;
  }

  // Iterating field values
  for (const fieldValue of result) {
    if (cancel) {
      return;
    }

    // Import history result statistics
    const inc: { success: number; failed: number; percentage: number } = {
      success: 0,
      failed: 0,
      percentage: percentagePerData,
    };

    // Collecting errors
    const errorMsgs: string[] = [];

    // Customer or company object to import
    const coc: any = {
      scopeBrandIds,
      customFieldsData: {},
    };

    let colIndex = 0;

    // Iterating through detailed properties
    for (const property of properties) {
      const value = fieldValue[colIndex] || '';

      switch (property.type) {
        case 'customProperty':
          {
            coc.customFieldsData[property.id] = fieldValue[colIndex];
          }
          break;

        case 'customData':
          {
            coc[property.name] = value.toString();
          }
          break;

        case 'basic':
          {
            coc[property.name] = value.toString();

            if (property.name === 'primaryEmail' && value) {
              coc.emails = [value];
            }

            if (property.name === 'primaryPhone' && value) {
              coc.phones = [value];
            }
          }
          break;
      }

      colIndex++;
    }

    // Creating coc
    await create(coc, user)
      .then(async cocObj => {
        await ImportHistory.updateOne({ _id: importHistoryId }, { $push: { ids: [cocObj._id] } });
        // Increasing success count
        inc.success++;
      })
      .catch((e: Error) => {
        inc.failed++;
        // Increasing failed count and pushing into error message

        switch (e.message) {
          case 'Duplicated email':
            errorMsgs.push(`Duplicated email ${coc.primaryEmail}`);
            break;
          case 'Duplicated phone':
            errorMsgs.push(`Duplicated phone ${coc.primaryPhone}`);
            break;
          case 'Duplicated name':
            errorMsgs.push(`Duplicated name ${coc.primaryName}`);
            break;
          default:
            errorMsgs.push(e.message);
            break;
        }
      });

    await ImportHistory.updateOne({ _id: importHistoryId }, { $inc: inc, $push: { errorMsgs } });

    let importHistory = await ImportHistory.findOne({ _id: importHistoryId });

    if (!importHistory) {
      throw new Error('Could not find import history');
    }

    if (importHistory.failed + importHistory.success === importHistory.total) {
      await ImportHistory.updateOne({ _id: importHistoryId }, { $set: { status: 'Done', percentage: 100 } });

      importHistory = await ImportHistory.findOne({ _id: importHistoryId });
    }

    if (!importHistory) {
      throw new Error('Could not find import history');
    }

    const fixedPercentage = (importHistory.percentage || 0).toFixed(0);

    if (fixedPercentage !== percentage) {
      percentage = fixedPercentage;

      graphqlPubsub.publish('importHistoryChanged', {
        importHistoryChanged: {
          _id: importHistory._id,
          status: importHistory.status,
          percentage,
        },
      });
    }
  }

  mongoose.connection.close();

  parentPort.postMessage('Successfully finished job');
});
