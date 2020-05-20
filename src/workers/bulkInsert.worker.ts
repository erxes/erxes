import * as mongoose from 'mongoose';
import { Companies, Customers, ImportHistory, Products, Tags, Users } from '../db/models';
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

  if (contentType === 'product') {
    create = Products.createProduct;
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

    const doc: any = {
      scopeBrandIds,
      customFieldsData: [],
    };

    let colIndex = 0;

    // Iterating through detailed properties
    for (const property of properties) {
      const value = fieldValue[colIndex] || '';

      switch (property.type) {
        case 'customProperty':
          {
            doc.customFieldsData.push({
              field: property.id,
              value: fieldValue[colIndex],
            });
          }
          break;

        case 'customData':
          {
            doc[property.name] = value.toString();
          }
          break;

        case 'ownerEmail':
          {
            const userEmail = value.toString();

            const owner = await Users.findOne({ email: userEmail }).lean();

            doc[property.name] = owner ? owner._id : '';
          }
          break;

        case 'tag':
          {
            const tagName = value.toString();

            const tag = await Tags.findOne({ name: new RegExp(`.*${tagName}.*`, 'i') }).lean();

            doc[property.name] = tag ? [tag._id] : [];
          }
          break;

        case 'basic':
          {
            doc[property.name] = value.toString();

            if (property.name === 'primaryEmail' && value) {
              doc.emails = [value];
            }

            if (property.name === 'primaryPhone' && value) {
              doc.phones = [value];
            }

            if (property.name === 'phones' && value) {
              doc.phones = value.toString().split(',');
            }

            if (property.name === 'emails' && value) {
              doc.emails = value.toString().split(',');
            }
          }
          break;
      }

      colIndex++;
    }

    if (contentType === 'customer' && !doc.emailValidationStatus) {
      doc.emailValidationStatus = 'unknown';
    }

    await create(doc, user)
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
            errorMsgs.push(`Duplicated email ${doc.primaryEmail}`);
            break;
          case 'Duplicated phone':
            errorMsgs.push(`Duplicated phone ${doc.primaryPhone}`);
            break;
          case 'Duplicated name':
            errorMsgs.push(`Duplicated name ${doc.primaryName}`);
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
