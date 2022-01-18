import * as mongoose from 'mongoose';
import { PLUGINS } from './constants';
import { Customers, Fields, ImportHistory } from '../db/models';
import { IUserDocument } from '../db/models/definitions/users';
import { debugWorkers } from '../debuggers';
import { fetchElk } from '../elasticsearch';
import { clearEmptyValues, connect, IMPORT_CONTENT_TYPE } from './utils';
import * as _ from 'underscore';
import { prepareCoreDocs } from './coreUtils';
import { MongoClient } from 'mongodb';

// tslint:disable-next-line
const { parentPort, workerData } = require('worker_threads');

const PLUGINSS = [
  {
    pluginType: 'deal',
    MONGO_URL: 'mongodb://localhost/erxes-sales',
    collection: 'deals',
    prepareDocCommand: `

    for (const fieldValue of result) {
      let doc: any = {
        customFieldsData: []
      };
  
      let colIndex = 0
      let boardName= '';
      let pipelineName = '';
      let stageName = '';
  

      for (const property of properties) {
        let value = (fieldValue[colIndex] || '').toString();
  
        switch (property.type) {
          case 'boardName':
            boardName = value;
            break;
  
          case 'pipelineName':
            pipelineName = value;
            break;
  
          case 'stageName':
            stageName = value;
            break;
        }
  
        colIndex++;
      }

      doc.userId = user._id;
  
      if (boardName && pipelineName && stageName) {
        let board = db.collection('boards').findOne({
          name: boardName,
          type: contentType
        });
        let pipeline = db.collection('pipelines').findOne({
          boardId: board && board._id,
          name: pipelineName
        });
        let stage = db.collection('stages').findOne({
          pipelineId: pipeline && pipeline._id,
          name: stageName
        });
  
        doc.stageId = stage && stage._id;
      }
  
      bulkDoc.push(doc);
    }

    `
  }
];

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
  useElkSyncer,
  db,
  importType,
  plugin
}: {
  docs: any;
  user: IUserDocument;
  contentType: string;
  useElkSyncer: boolean;
  db: any;
  importType: string;
  plugin: any;
}) => {
  const { CUSTOMER, LEAD } = IMPORT_CONTENT_TYPE;

  let objects;

  let updated: number = 0;

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

  const generateUpdateDocs = async (
    _id,
    doc,
    prevCustomFieldsData: any = []
  ) => {
    let customFieldsData: Array<{ field: string; value: string }> = [];

    updated++;

    console.log(PLUGINSS);

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

    const collections = (response && response.hits.hits) || [];

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

    debugWorkers(`Update doc length: ${updateDocs.length}`);

    if (updateDocs.length > 0) {
      await Customers.bulkWrite(updateDocs);
    }

    objects = await Customers.insertMany(insertDocs);
  }

  if (importType === 'plugin') {
    debugWorkers('Importin plugin data');
    const result = await db.collection(plugin.collection).insertMany(docs);

    objects = result.ops;
  }

  return { objects, updated };
};

connect().then(async () => {
  if (cancel) {
    return;
  }

  debugWorkers(`Worker message rece111ived`);

  const {
    user,
    scopeBrandIds,
    result,
    contentType,
    type,
    pluginType,
    properties,
    importHistoryId,
    percentage,
    useElkSyncer,
    rowIndex
  }: {
    user: IUserDocument;
    scopeBrandIds: string[];
    result: any;
    contentType: string;
    type: string;
    pluginType: string;
    properties: Array<{ [key: string]: string }>;
    importHistoryId: string;
    percentage: number;
    useElkSyncer: boolean;
    rowIndex?: number;
  } = workerData;

  let bulkDoc: any = [];

  let db: any;
  let plugin: any;

  if (type === 'core') {
    bulkDoc = await prepareCoreDocs(
      result,
      properties,
      contentType,
      scopeBrandIds,
      bulkDoc
    );
  }

  if (type === 'plugin') {
    plugin = PLUGINS.find(value => {
      return value.pluginType === pluginType;
    });

    if (plugin) {
      try {
        const client = new MongoClient(plugin.MONGO_URL);
        await client.connect();
        db = client.db();

        // tslint:disable-next-line:no-eval
        bulkDoc = await prepareCoreDocs(
          result,
          properties,
          contentType,
          scopeBrandIds,
          bulkDoc
        );
      } catch (e) {
        debugWorkers(e);
      }
    }
  }
  const modifier: { $inc?; $push? } = {
    $inc: { percentage }
  };

  try {
    const { updated, objects } = await create({
      docs: bulkDoc,
      user,
      contentType,
      useElkSyncer,
      db,
      plugin,
      importType: type
    });

    const cocIds = objects.map(obj => obj._id).filter(obj => obj);

    modifier.$push = { ids: cocIds };
    modifier.$inc.updated = updated;
    modifier.$inc.success = bulkDoc.length;
  } catch (e) {
    let startRow = 1;
    let endRow = bulkDoc.length;

    if (rowIndex && rowIndex > 1) {
      startRow = rowIndex * bulkDoc.length - bulkDoc.length;
      endRow = rowIndex * bulkDoc.length;
    }

    const distance = endRow - startRow;

    if (distance === 1) {
      endRow = startRow;
    }

    modifier.$push = { errorMsgs: e.message };
    modifier.$inc.failed = bulkDoc.length;
    modifier.$push = {
      errorMsgs: {
        startRow,
        endRow,
        errorMsgs: e.message,
        contentType
      }
    };
  }

  await ImportHistory.updateOne({ _id: importHistoryId }, modifier);

  mongoose.connection.close();

  debugWorkers(`Worker done`);

  parentPort.postMessage({
    action: 'remove',
    message: 'Successfully finished the job'
  });
});
