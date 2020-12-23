import * as mongoose from 'mongoose';
import { validateSingle } from '../data/verifierUtils';
import {
  ActivityLogs,
  Boards,
  Companies,
  Conformities,
  Customers,
  Deals,
  Fields,
  ImportHistory,
  Pipelines,
  Products,
  Stages,
  Tags,
  Tasks,
  Tickets,
  Users
} from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';
import { connect, generatePronoun, IMPORT_CONTENT_TYPE } from './utils';

const customCreate = async (doc, user, type) => {
  let object;

  if (type === IMPORT_CONTENT_TYPE.CUSTOMER) {
    if (!doc.ownerId && user) {
      doc.ownerId = user._id;
    }

    if (doc.primaryEmail && !doc.emails) {
      doc.emails = [doc.primaryEmail];
    }

    if (doc.primaryPhone && !doc.phones) {
      doc.phones = [doc.primaryPhone];
    }

    // clean custom field values
    doc.customFieldsData = await Fields.prepareCustomFieldsData(
      doc.customFieldsData
    );

    if (doc.integrationId) {
      doc.relatedIntegrationIds = [doc.integrationId];
    }

    const pssDoc = await Customers.calcPSS(doc);

    object = await Customers.create({
      createdAt: new Date(),
      modifiedAt: new Date(),
      ...doc,
      ...pssDoc
    });

    if (
      (doc.primaryEmail && !doc.emailValidationStatus) ||
      (doc.primaryEmail && doc.emailValidationStatus === 'unknown')
    ) {
      validateSingle({ email: doc.primaryEmail });
    }

    if (
      (doc.primaryPhone && !doc.phoneValidationStatus) ||
      (doc.primaryPhone && doc.phoneValidationStatus === 'unknown')
    ) {
      validateSingle({ phone: doc.primaryPhone });
    }
  }

  if (type === IMPORT_CONTENT_TYPE.COMPANY) {
    if (!doc.ownerId && user) {
      doc.ownerId = user._id;
    }

    // clean custom field values
    doc.customFieldsData = await Fields.prepareCustomFieldsData(
      doc.customFieldsData
    );

    object = await Companies.create({
      ...doc,
      createdAt: new Date(),
      modifiedAt: new Date(),
      searchText: Companies.fillSearchText(doc)
    });
  }

  await ActivityLogs.createCocLog({
    coc: object,
    contentType: type
  });

  return object;
};

export const bulkInsert = async (data: {
  user: IUserDocument;
  scopeBrandIds: string[];
  result;
  contentType: string;
  properties: Array<{ [key: string]: string }>;
  importHistoryId: string;
}) => {
  const {
    user,
    scopeBrandIds,
    result,
    contentType,
    properties,
    importHistoryId
  } = data;
  if (mongoose.connection.readyState === 0) {
    await connect();
  }

  let create: any = null;

  const isBoardItem = (): boolean =>
    contentType === 'deal' ||
    contentType === 'task' ||
    contentType === 'ticket';

  switch (contentType) {
    case 'company':
    case 'customer':
    case 'lead':
      create = customCreate;
      break;
    case 'product':
      create = Products.createProduct;
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
    // Import history result statistics
    const inc: { success: number; failed: number } = {
      success: 0,
      failed: 0
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
        inc.failed++;
        errorMsgs.push(e.message);
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
};
