import * as mongoose from 'mongoose';
import {
  Boards,
  Companies,
  Conformities,
  Customers,
  Deals,
  ImportHistory,
  Pipelines,
  Products,
  Stages,
  Tags,
  Tasks,
  Tickets,
  Users
} from '../db/models';
import {
  clearEmptyValues,
  connect,
  generatePronoun,
  updateDuplicatedValue
} from './utils';

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

  const {
    user,
    scopeBrandIds,
    result,
    contentType,
    properties,
    importHistoryId,
    percentagePerData
  } = workerData;

  let create: any = null;
  let model: any = null;

  const isBoardItem = (): boolean =>
    contentType === 'deal' ||
    contentType === 'task' ||
    contentType === 'ticket';

  switch (contentType) {
    case 'company':
      create = Companies.createCompany;
      model = Companies;
      break;
    case 'customer':
      create = Customers.createCustomer;
      model = Customers;
      break;
    case 'lead':
      create = Customers.createCustomer;
      model = Customers;
      break;
    case 'product':
      create = Products.createProduct;
      model = Products;
      break;
    case 'deal':
      create = Deals.createDeal;
      break;
    case 'task':
      create = Tasks.createTask;
      break;
    case 'ticket':
      create = Tickets.createTicket;
      break;
    default:
      break;
  }

  if (!create) {
    throw new Error(`Unsupported content type "${contentType}"`);
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
      percentage: percentagePerData
    };

    // Collecting errors
    const errorMsgs: string[] = [];

    const doc: any = {
      scopeBrandIds,
      customFieldsData: []
    };

    let colIndex: number = 0;
    let boardName: string = '';
    let pipelineName: string = '';
    let stageName: string = '';

    // Iterating through detailed properties
    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();

      if (contentType === 'customer') {
        doc.state = 'customer';
      }
      if (contentType === 'lead') {
        doc.state = 'lead';
      }

      switch (property.type) {
        case 'customProperty':
          {
            doc.customFieldsData.push({
              field: property.id,
              value: fieldValue[colIndex]
            });
          }
          break;

        case 'customData':
          {
            doc[property.name] = value;
          }
          break;

        case 'ownerEmail':
          {
            const userEmail = value;

            const owner = await Users.findOne({ email: userEmail }).lean();

            doc[property.name] = owner ? owner._id : '';
          }
          break;

        case 'pronoun':
          {
            doc.sex = generatePronoun(value);
          }
          break;

        case 'companiesPrimaryNames':
          {
            doc.companiesPrimaryNames = value.split(',');
          }
          break;

        case 'customersPrimaryEmails':
          doc.customersPrimaryEmails = value.split(',');
          break;

        case 'boardName':
          boardName = value;
          break;

        case 'pipelineName':
          pipelineName = value;
          break;

        case 'stageName':
          stageName = value;
          break;

        case 'tag':
          {
            const tagName = value;

            const tag = await Tags.findOne({
              name: new RegExp(`.*${tagName}.*`, 'i')
            }).lean();

            doc[property.name] = tag ? [tag._id] : [];
          }
          break;

        case 'basic':
          {
            doc[property.name] = value;

            if (property.name === 'primaryName' && value) {
              doc.names = [value];
            }

            if (property.name === 'primaryEmail' && value) {
              doc.emails = [value];
            }

            if (property.name === 'primaryPhone' && value) {
              doc.phones = [value];
            }

            if (property.name === 'phones' && value) {
              doc.phones = value.split(',');
            }

            if (property.name === 'emails' && value) {
              doc.emails = value.split(',');
            }

            if (property.name === 'names' && value) {
              doc.names = value.split(',');
            }

            if (property.name === 'isComplete') {
              doc.isComplete = Boolean(value);
            }
          }
          break;
      } // end property.type switch

      colIndex++;
    } // end properties for loop

    if (
      (contentType === 'customer' || contentType === 'lead') &&
      !doc.emailValidationStatus
    ) {
      doc.emailValidationStatus = 'unknown';
    }

    if (
      (contentType === 'customer' || contentType === 'lead') &&
      !doc.phoneValidationStatus
    ) {
      doc.phoneValidationStatus = 'unknown';
    }

    // set board item created user
    if (isBoardItem()) {
      doc.userId = user._id;

      if (boardName && pipelineName && stageName) {
        const board = await Boards.findOne({
          name: boardName,
          type: contentType
        });
        const pipeline = await Pipelines.findOne({
          boardId: board && board._id,
          name: pipelineName
        });
        const stage = await Stages.findOne({
          pipelineId: pipeline && pipeline._id,
          name: stageName
        });

        doc.stageId = stage && stage._id;
      }
    }

    await create(doc, user)
      .then(async cocObj => {
        if (
          doc.companiesPrimaryNames &&
          doc.companiesPrimaryNames.length > 0 &&
          contentType !== 'company'
        ) {
          const companyIds: string[] = [];

          for (const primaryName of doc.companiesPrimaryNames) {
            let company = await Companies.findOne({ primaryName }).lean();

            if (company) {
              companyIds.push(company._id);
            } else {
              company = await Companies.createCompany({ primaryName });

              companyIds.push(company._id);
            }
          }

          for (const _id of companyIds) {
            await Conformities.addConformity({
              mainType: contentType === 'lead' ? 'customer' : contentType,
              mainTypeId: cocObj._id,
              relType: 'company',
              relTypeId: _id
            });
          }
        }

        if (
          doc.customersPrimaryEmails &&
          doc.customersPrimaryEmails.length > 0 &&
          contentType !== 'customer'
        ) {
          const customers = await Customers.find(
            { primaryEmail: { $in: doc.customersPrimaryEmails } },
            { _id: 1 }
          );
          const customerIds = customers.map(customer => customer._id);

          for (const _id of customerIds) {
            await Conformities.addConformity({
              mainType: contentType === 'lead' ? 'customer' : contentType,
              mainTypeId: cocObj._id,
              relType: 'customer',
              relTypeId: _id
            });
          }
        }

        await ImportHistory.updateOne(
          { _id: importHistoryId },
          { $push: { ids: [cocObj._id] } }
        );

        // Increasing success count
        inc.success++;
      })
      .catch(async (e: Error) => {
        const updatedDoc = clearEmptyValues(doc);

        // Increasing failed count and pushing into error message

        switch (e.message) {
          case 'Duplicated email':
            inc.success++;
            await updateDuplicatedValue(model, 'primaryEmail', updatedDoc);
            break;
          case 'Duplicated phone':
            inc.success++;
            await updateDuplicatedValue(model, 'primaryPhone', updatedDoc);
            break;
          case 'Duplicated name':
            inc.success++;
            await updateDuplicatedValue(model, 'primaryName', updatedDoc);
            break;
          default:
            inc.failed++;
            errorMsgs.push(e.message);
            break;
        }
      });

    await ImportHistory.updateOne(
      { _id: importHistoryId },
      { $inc: inc, $push: { errorMsgs } }
    );

    let importHistory = await ImportHistory.findOne({ _id: importHistoryId });

    if (!importHistory) {
      throw new Error('Could not find import history');
    }

    if (importHistory.failed + importHistory.success === importHistory.total) {
      await ImportHistory.updateOne(
        { _id: importHistoryId },
        { $set: { status: 'Done', percentage: 100 } }
      );

      importHistory = await ImportHistory.findOne({ _id: importHistoryId });
    }

    if (!importHistory) {
      throw new Error('Could not find import history');
    }
  }

  mongoose.connection.close();

  parentPort.postMessage('Successfully finished job');
});
