import * as mongoose from 'mongoose';
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
  ProductCategories,
  Products,
  Stages,
  Tags,
  Tasks,
  Tickets,
  Users
} from '../db/models';
import { fillSearchTextItem } from '../db/models/boardUtils';
import { IConformityAdd } from '../db/models/definitions/conformities';
import { IUserDocument } from '../db/models/definitions/users';
import { connect, generatePronoun, IMPORT_CONTENT_TYPE } from './utils';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

let cancel = false;

parentPort.once('message', message => {
  if (message === 'cancel') {
    parentPort.postMessage('Cancelled');
    cancel = true;
  }
});

const create = async ({
  docs,
  user,
  contentType,
  model
}: {
  docs: any;
  user: IUserDocument;
  contentType: string;
  model: any;
}) => {
  const {
    PRODUCT,
    CUSTOMER,
    COMPANY,
    DEAL,
    TASK,
    TICKET
  } = IMPORT_CONTENT_TYPE;

  let objects;

  const conformityMapping = {};

  if (contentType === CUSTOMER) {
    docs.map(async (doc, docIndex) => {
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

      const { profileScore, searchText, state } = await Customers.calcPSS(doc);

      doc.profileScore = profileScore;
      doc.searchText = searchText;
      doc.state = state;
      doc.createdAt = new Date();
      doc.modifiedAt = new Date();

      if (doc.companiesPrimaryNames && doc.companiesPrimaryNames.length > 0) {
        const companyIds = await Companies.find({
          primaryName: { $in: doc.companiesPrimaryNames }
        }).distinct('_id');

        for (const id of companyIds) {
          if (!conformityMapping[docIndex]) {
            conformityMapping[docIndex] = [];
          }

          conformityMapping[docIndex].push({
            relType: 'company',
            mainType: contentType === 'lead' ? 'customer' : contentType,
            relTypeId: id
          });
        }
      }
    });

    objects = await Customers.insertMany(docs);
  }

  if (contentType === COMPANY) {
    docs.map(async (doc, docIndex) => {
      if (!doc.ownerId && user) {
        doc.ownerId = user._id;
      }

      // clean custom field values
      doc.customFieldsData = await Fields.prepareCustomFieldsData(
        doc.customFieldsData
      );

      doc.searchText = Companies.fillSearchText(doc);
      doc.createdAt = new Date();
      doc.modifiedAt = new Date();

      if (doc.customersPrimaryEmails && doc.customersPrimaryEmails.length > 0) {
        const customerIds = await Customers.find({
          primaryEmail: { $in: doc.customersPrimaryEmails }
        }).distinct('_id');

        for (const id of customerIds) {
          if (!conformityMapping[docIndex]) {
            conformityMapping[docIndex] = [];
          }

          conformityMapping[docIndex].push({
            relType: 'customer',
            mainType: contentType === 'lead' ? 'customer' : contentType,
            relTypeId: id
          });
        }
      }
    });

    objects = await Companies.insertMany(docs);
  }

  if (contentType === PRODUCT) {
    const codes = docs.map(doc => doc.code);

    const categories = await ProductCategories.find(
      { code: { $in: codes } },
      { _id: 1, code: 1 }
    );

    if (!categories) {
      throw new Error('Product & service category not found');
    }

    for (const doc of docs) {
      const category = categories.find(cat => cat.code === doc.code);

      if (category) {
        doc.categoryId = category._id;
      }

      doc.customFieldsData = await Fields.prepareCustomFieldsData(
        doc.customFieldsData
      );
    }

    objects = await Products.insertMany(docs);
  }

  if ([DEAL, TASK, TICKET].includes(contentType)) {
    const conversationIds = docs.map(doc => doc.sourceConversationId);

    const conversations = await model.find({
      sourceConversationId: { $in: conversationIds }
    });

    if (conversations) {
      throw new Error(`Already converted a ${contentType}`);
    }

    for (const doc of docs) {
      doc.createdAt = new Date();
      doc.modifiedAt = new Date();
      doc.searchText = fillSearchTextItem(doc);
    }

    objects = await model.insertMany(docs);

    await ActivityLogs.createBoardItemsLog({
      items: docs,
      contentType
    });
  }

  if (contentType === CUSTOMER || contentType === COMPANY) {
    await ActivityLogs.createCocLogs({
      cocs: objects,
      contentType
    });

    if (Object.keys(conformityMapping).length > 0) {
      const conformityDocs: IConformityAdd[] = [];

      objects.map(async (object, objectIndex) => {
        const items = conformityMapping[objectIndex] || [];

        if (items.length === 0) {
          return;
        }

        for (const item of items) {
          item.mainTypeId = object._id;
        }

        conformityDocs.push(...items);
      });

      await Conformities.insertMany(conformityDocs);
    }
  }

  return objects;
};

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
    percentage
  }: {
    user: IUserDocument;
    scopeBrandIds: string[];
    result: any;
    contentType: string;
    properties: Array<{ [key: string]: string }>;
    importHistoryId: string;
    percentage: number;
  } = workerData;

  let model: any = null;

  const isBoardItem = (): boolean =>
    contentType === 'deal' ||
    contentType === 'task' ||
    contentType === 'ticket';

  switch (contentType) {
    case 'deal':
      model = Deals;
      break;
    case 'task':
      model = Tasks;
      break;
    case 'ticket':
      model = Tickets;
      break;
    default:
      break;
  }

  if (!Object.values(IMPORT_CONTENT_TYPE).includes(contentType)) {
    throw new Error(`Unsupported content type "${contentType}"`);
  }

  const bulkDoc: any = [];

  // Iterating field values
  for (const fieldValue of result) {
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

    bulkDoc.push(doc);
  }

  const cocObjs = await create({ docs: bulkDoc, user, contentType, model });

  const cocIds = cocObjs.map(obj => obj._id).filter(obj => obj);

  await ImportHistory.updateOne(
    { _id: importHistoryId },
    {
      $inc: { success: bulkDoc.length, percentage },
      $push: { ids: cocIds }
    }
  );

  mongoose.connection.close();

  parentPort.postMessage({
    action: 'remove',
    message: 'Successfully finished the job'
  });
});
