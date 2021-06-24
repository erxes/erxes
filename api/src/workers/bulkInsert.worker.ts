import * as mongoose from 'mongoose';
import {
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
import { debugWorkers } from '../debuggers';
import { fetchElk } from '../elasticsearch';
import {
  clearEmptyValues,
  connect,
  generatePronoun,
  IMPORT_CONTENT_TYPE
} from './utils';
import * as _ from 'underscore';

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
  model,
  useElkSyncer
}: {
  docs: any;
  user: IUserDocument;
  contentType: string;
  model: any;
  useElkSyncer: boolean;
}) => {
  const {
    PRODUCT,
    CUSTOMER,
    COMPANY,
    DEAL,
    TASK,
    TICKET,
    LEAD
  } = IMPORT_CONTENT_TYPE;

  let objects;

  const conformityCompanyMapping = {};
  const conformityCustomerMapping = {};
  const updateDocs: any = [];

  let insertDocs: any = [];

  const bulkValues: {
    primaryEmail: string[];
    primaryPhone: string[];
    primaryName: string[];
    code: string[];
  } = {
    primaryEmail: [],
    primaryPhone: [],
    primaryName: [],
    code: []
  };

  const docIdsByPrimaryEmail = {};
  const docIdsByPrimaryPhone = {};
  const docIdsByPrimaryName = {};
  const docIdsByCode = {};

  const customFieldsByPrimaryEmail = {};
  const customFieldsByPrimaryPhone = {};
  const customFieldsByPrimaryName = {};
  const customFieldsByCode = {};

  const generateUpdateDocs = async (_id, doc, prevCustomFieldsData) => {
    let customFieldsData: Array<{ field: string; value: string }> = [];

    if (
      doc.customFieldsData &&
      doc.customFieldsData.length > 0 &&
      prevCustomFieldsData.length > 0
    ) {
      doc.customFieldsData.map(data => {
        customFieldsData.push({ field: data.field, value: data.value });
      });

      prevCustomFieldsData.map(data => {
        customFieldsData.push({ field: data.field, value: data.value });
      });

      customFieldsData = _.uniq(customFieldsData, 'field');

      doc.customFieldsData = await Fields.prepareCustomFieldsData(
        customFieldsData
      );
    }

    updateDocs.push({
      updateOne: {
        filter: { _id },
        update: {
          $set: { ...clearEmptyValues(doc), modifiedAt: new Date() }
        }
      }
    });
  };

  const prepareDocs = async (body, type, collectionDocs) => {
    debugWorkers(`prepareDocs called`);

    const response = await fetchElk({
      action: 'search',
      index: type,
      body: {
        query: { bool: { should: body } },
        _source: [
          '_id',
          'primaryEmail',
          'primaryPhone',
          'primaryName',
          'code',
          'customFieldsData'
        ]
      }
    });

    const collections = response.hits.hits || [];

    for (const collection of collections) {
      const doc = collection._source;

      if (doc.primaryEmail) {
        docIdsByPrimaryEmail[doc.primaryEmail] = collection._id;
        customFieldsByPrimaryEmail[doc.primaryEmail] =
          doc.customFieldsData || [];

        continue;
      }

      if (doc.primaryPhone) {
        docIdsByPrimaryPhone[doc.primaryPhone] = collection._id;
        customFieldsByPrimaryPhone[doc.docIdsByPrimaryPhone] =
          doc.customFieldsData || [];
        continue;
      }

      if (doc.primaryName) {
        docIdsByPrimaryName[doc.primaryName] = collection._id;
        customFieldsByPrimaryName[doc.primaryName] = doc.customFieldsData || [];
        continue;
      }

      if (doc.code) {
        docIdsByCode[doc.code] = collection._id;
        customFieldsByCode[doc.code] = doc.customFieldsData || [];
        continue;
      }
    }

    for (const doc of collectionDocs) {
      if (doc.primaryEmail && docIdsByPrimaryEmail[doc.primaryEmail]) {
        await generateUpdateDocs(
          docIdsByPrimaryEmail[doc.primaryEmail],
          doc,
          customFieldsByPrimaryEmail[doc.primaryEmail]
        );
        continue;
      }

      if (doc.primaryPhone && docIdsByPrimaryPhone[doc.primaryPhone]) {
        await generateUpdateDocs(
          docIdsByPrimaryPhone[doc.primaryPhone],
          doc,
          customFieldsByPrimaryPhone[doc.primaryPhone]
        );
        continue;
      }

      if (doc.primaryName && docIdsByPrimaryName[doc.primaryName]) {
        await generateUpdateDocs(
          docIdsByPrimaryName[doc.primaryName],
          doc,
          customFieldsByPrimaryName[doc.customFieldsByPrimaryName]
        );
        continue;
      }

      if (doc.code && docIdsByCode[doc.code]) {
        await generateUpdateDocs(
          docIdsByCode[doc.code],
          doc,
          customFieldsByCode[doc.code]
        );
        continue;
      }

      insertDocs.push(doc);
    }
  };

  const createConformityMapping = async ({
    index,
    field,
    values,
    conformityTypeModel,
    relType
  }: {
    index: number;
    field: string;
    values: string[];
    conformityTypeModel: any;
    relType: string;
  }) => {
    if (values.length === 0 && contentType !== relType) {
      return;
    }

    const mapping =
      relType === 'customer'
        ? conformityCustomerMapping
        : conformityCompanyMapping;

    const ids = await conformityTypeModel
      .find({ [field]: { $in: values } })
      .distinct('_id');

    if (ids.length === 0) {
      return;
    }

    for (const id of ids) {
      if (!mapping[index]) {
        mapping[index] = [];
      }

      mapping[index].push({
        relType,
        mainType: contentType === 'lead' ? 'customer' : contentType,
        relTypeId: id
      });
    }
  };

  if (contentType === CUSTOMER || contentType === LEAD) {
    debugWorkers('Worker: Import customer data');
    debugWorkers(`useElkSyncer:  ${useElkSyncer}`);

    for (const doc of docs) {
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

      bulkValues.primaryEmail.push(doc.primaryEmail);
      bulkValues.primaryPhone.push(doc.primaryPhone);
      bulkValues.code.push(doc.code);
    }

    if (useElkSyncer) {
      bulkValues.primaryEmail = bulkValues.primaryEmail.filter(value => value);
      bulkValues.primaryPhone = bulkValues.primaryPhone.filter(value => value);
      bulkValues.code = bulkValues.code.filter(value => value);

      const queries: Array<{ terms: { [key: string]: string[] } }> = [];

      if (bulkValues.primaryEmail.length > 0) {
        queries.push({ terms: { primaryEmail: bulkValues.primaryEmail } });
      }

      if (bulkValues.primaryPhone.length > 0) {
        queries.push({
          terms: { 'primaryPhone.raw': bulkValues.primaryPhone }
        });
      }

      if (bulkValues.code.length > 0) {
        queries.push({ terms: { 'code.raw': bulkValues.code } });
      }

      await prepareDocs(queries, 'customers', docs);
    } else {
      insertDocs = docs;
    }

    debugWorkers(`Insert doc length: ${insertDocs.length}`);

    insertDocs.map(async (doc, docIndex) => {
      await createConformityMapping({
        index: docIndex,
        field: 'primaryName',
        values: doc.companiesPrimaryNames || [],
        conformityTypeModel: Companies,
        relType: 'company'
      });
    });

    debugWorkers(`Update doc length: ${updateDocs.length}`);

    if (updateDocs.length > 0) {
      await Customers.bulkWrite(updateDocs);
    }

    objects = await Customers.insertMany(insertDocs);
  }

  if (contentType === COMPANY) {
    for (const doc of docs) {
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

      bulkValues.primaryName.push(doc.primaryName);
    }

    if (useElkSyncer) {
      bulkValues.primaryName = bulkValues.primaryName.filter(value => value);

      await prepareDocs(
        [{ terms: { 'primaryName.raw': bulkValues.primaryName } }],
        'companies',
        docs
      );
    } else {
      insertDocs = docs;
    }

    insertDocs.map(async (doc, docIndex) => {
      await createConformityMapping({
        index: docIndex,
        field: 'primaryEmail',
        values: doc.customersPrimaryEmails || [],
        conformityTypeModel: Customers,
        relType: 'customer'
      });
    });

    if (updateDocs.length > 0) {
      await Companies.bulkWrite(updateDocs);
    }

    objects = await Companies.insertMany(insertDocs);
  }

  if (contentType === PRODUCT) {
    const categoryCodes = docs.map(doc => doc.categoryCode);

    const categories = await ProductCategories.find(
      { code: { $in: categoryCodes } },
      { _id: 1, code: 1 }
    );

    const vendorCodes = docs.map(doc => doc.vendorCode);
    const vendors = await Companies.find(
      {
        $or: [
          { code: { $in: vendorCodes } },
          { primaryEmail: { $in: vendorCodes } },
          { primaryPhone: { $in: vendorCodes } },
          { primaryName: { $in: vendorCodes } }
        ]
      },
      { _id: 1, code: 1, primaryEmail: 1, primaryPhone: 1, primaryName: 1 }
    );

    if (!categories) {
      throw new Error(
        'Product & service category not found check categoryCode field'
      );
    }

    for (const doc of docs) {
      const category = categories.find(cat => cat.code === doc.categoryCode);

      if (category) {
        doc.categoryId = category._id;
      } else {
        throw new Error(
          'Product & service category not found check categoryCode field'
        );
      }

      if (doc.vendorCode) {
        const vendor = vendors.find(
          v =>
            v.code === doc.vendorCode ||
            v.primaryName === doc.vendorCode ||
            v.primaryEmail === doc.vendorCode ||
            v.primaryPhone === doc.vendorCode
        );

        if (vendor) {
          doc.vendorId = vendor._id;
        } else {
          throw new Error(
            'Product & service vendor not found check VendorCode field'
          );
        }
      }

      doc.unitPrice = parseFloat(
        doc.unitPrice ? doc.unitPrice.replace(/,/g, '') : 0
      );

      doc.customFieldsData = await Fields.prepareCustomFieldsData(
        doc.customFieldsData
      );
    }

    objects = await Products.insertMany(docs);
  }

  if ([DEAL, TASK, TICKET].includes(contentType)) {
    const conversationIds = docs
      .map(doc => doc.sourceConversationId)
      .filter(item => item);

    const conversations = await model.find({
      sourceConversationId: { $in: conversationIds }
    });

    if (conversations && conversations.length > 0) {
      throw new Error(`Already converted a ${contentType}`);
    }

    docs.map(async (doc, docIndex) => {
      doc.createdAt = new Date();
      doc.modifiedAt = new Date();
      doc.searchText = fillSearchTextItem(doc);

      await createConformityMapping({
        index: docIndex,
        field: 'primaryEmail',
        values: doc.customersPrimaryEmails || [],
        conformityTypeModel: Customers,
        relType: 'customer'
      });

      await createConformityMapping({
        index: docIndex,
        field: 'primaryName',
        values: doc.companiesPrimaryNames || [],
        conformityTypeModel: Companies,
        relType: 'company'
      });
    });

    objects = await model.insertMany(docs);
  }

  // create conformity
  if (contentType !== PRODUCT) {
    const createConformity = async mapping => {
      if (Object.keys(mapping).length === 0) {
        return;
      }

      const conformityDocs: IConformityAdd[] = [];

      objects.map(async (object, objectIndex) => {
        const items = mapping[objectIndex] || [];

        if (items.length === 0) {
          return;
        }

        for (const item of items) {
          item.mainTypeId = object._id;
        }

        conformityDocs.push(...items);
      });

      await Conformities.insertMany(conformityDocs);
    };

    await createConformity(conformityCompanyMapping);
    await createConformity(conformityCustomerMapping);
  }

  return objects;
};

connect().then(async () => {
  if (cancel) {
    return;
  }

  debugWorkers(`Worker message received`);

  const {
    user,
    scopeBrandIds,
    result,
    contentType,
    properties,
    importHistoryId,
    useElkSyncer,
    percentage
  }: {
    user: IUserDocument;
    scopeBrandIds: string[];
    result: any;
    contentType: string;
    properties: Array<{ [key: string]: string }>;
    importHistoryId: string;
    percentage: number;
    useElkSyncer: boolean;
  } = workerData;

  let model: any = null;

  const isBoardItem = (): boolean =>
    contentType === 'deal' ||
    contentType === 'task' ||
    contentType === 'ticket';

  switch (contentType) {
    case 'customer':
    case 'lead':
      model = Customers;
      break;
    case 'company':
      model = Companies;
      break;
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

        case 'categoryCode':
          doc.categoryCode = value;
          break;

        case 'vendorCode':
          doc.vendorCode = value;
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

  const modifier: { $inc?; $push? } = {
    $inc: { percentage }
  };

  try {
    const cocObjs = await create({
      docs: bulkDoc,
      user,
      contentType,
      model,
      useElkSyncer
    });

    const cocIds = cocObjs.map(obj => obj._id).filter(obj => obj);

    modifier.$push = { ids: cocIds };
    modifier.$inc.success = bulkDoc.length;
  } catch (e) {
    modifier.$push = { errorMsgs: e.message };
    modifier.$inc.failed = bulkDoc.length;
  }

  await ImportHistory.updateOne({ _id: importHistoryId }, modifier);

  mongoose.connection.close();

  debugWorkers(`Worker done`);

  parentPort.postMessage({
    action: 'remove',
    message: 'Successfully finished the job'
  });
});
