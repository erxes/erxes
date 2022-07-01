import { fetchEs } from '@erxes/api-utils/src/elasticsearch';
import * as _ from 'underscore';
import { generateModels } from './connectionResolver';
import { EXPORT_TYPES, IMPORT_TYPES } from './constants';
import { clearEmptyValues, generatePronoun } from './importUtils';
import {
  sendCoreMessage,
  sendFormsMessage,
  sendTagsMessage
} from './messageBroker';

export default {
  importTypes: IMPORT_TYPES,
  exportTypes: EXPORT_TYPES,
  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { Customers, Companies } = models;

    const { docs, user, contentType, useElkSyncer } = data;

    try {
      let objects;

      let updated: number = 0;

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

        const ids = await conformityTypeModel
          .find({ [field]: { $in: values } })
          .distinct('_id');

        if (ids.length === 0) {
          return;
        }

        for (const id of ids) {
          if (!conformityCustomerMapping[index]) {
            conformityCustomerMapping[index] = [];
          }

          conformityCustomerMapping[index].push({
            relType,
            mainType: contentType === 'lead' ? 'customer' : contentType,
            relTypeId: id
          });
        }
      };

      const generateUpdateDocs = async (
        _id,
        doc,
        prevCustomFieldsData: any = []
      ) => {
        let customFieldsData: Array<{ field: string; value: string }> = [];

        updated++;

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
        const response = await fetchEs({
          subdomain,
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
            customFieldsByPrimaryName[doc.primaryName] =
              doc.customFieldsData || [];
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

      if (contentType === 'customer' || contentType === 'lead') {
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

          if (doc.integrationId) {
            doc.relatedIntegrationIds = [doc.integrationId];
          }

          const { profileScore, searchText, state } = await Customers.calcPSS(
            doc
          );

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
          bulkValues.primaryEmail = bulkValues.primaryEmail.filter(
            value => value
          );
          bulkValues.primaryPhone = bulkValues.primaryPhone.filter(
            value => value
          );
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

        console.log(`Insert doc length: ${insertDocs.length}`);

        insertDocs.map(async (doc, docIndex) => {
          await createConformityMapping({
            index: docIndex,
            field: 'primaryName',
            values: doc.companiesPrimaryNames || [],
            conformityTypeModel: Companies,
            relType: 'company'
          });

          await createConformityMapping({
            index: docIndex,
            field: 'primaryEmail',
            values: doc.companiesPrimaryEmails || [],
            conformityTypeModel: Companies,
            relType: 'company'
          });
        });

        if (updateDocs.length > 0) {
          await Customers.bulkWrite(updateDocs);
        }

        objects = await Customers.insertMany(insertDocs);
      }

      if (contentType === 'company') {
        for (const doc of docs) {
          if (!doc.ownerId && user) {
            doc.ownerId = user._id;
          }

          doc.searchText = Companies.fillSearchText(doc);
          doc.createdAt = new Date();
          doc.modifiedAt = new Date();

          bulkValues.primaryName.push(doc.primaryName);
          bulkValues.primaryEmail.push(doc.primaryEmail);
          bulkValues.primaryPhone.push(doc.primaryPhone);
          bulkValues.code.push(doc.code);
        }

        if (useElkSyncer) {
          bulkValues.primaryName = bulkValues.primaryName.filter(
            value => value
          );
          bulkValues.primaryEmail = bulkValues.primaryEmail.filter(
            value => value
          );
          bulkValues.primaryPhone = bulkValues.primaryPhone.filter(
            value => value
          );
          bulkValues.code = bulkValues.code.filter(value => value);

          const queries: Array<{ terms: { [key: string]: string[] } }> = [];

          if (bulkValues.primaryName.length > 0) {
            queries.push({
              terms: { 'primaryName.raw': bulkValues.primaryName }
            });
          }

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

          await prepareDocs(queries, 'companies', docs);
        } else {
          insertDocs = docs;
        }

        if (updateDocs.length > 0) {
          await Companies.bulkWrite(updateDocs);
        }

        objects = await Companies.insertMany(insertDocs);
      }

      const createConformity = async mapping => {
        if (Object.keys(mapping).length === 0) {
          return;
        }

        const conformityDocs: any[] = [];

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

        await sendCoreMessage({
          subdomain,
          action: 'conformities.addConformities',
          data: conformityDocs
        });
      };

      await createConformity(conformityCustomerMapping);

      return { objects, updated };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const { scopeBrandIds, result, contentType, properties } = data;

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {
        scopeBrandIds,
        customFieldsData: []
      };

      let colIndex: number = 0;

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || '').toString();

        if (contentType === 'customer') {
          doc.state = 'customer';
        }
        if (contentType === 'lead') {
          doc.state = 'lead';
        }

        switch (property.name) {
          case 'customProperty':
            {
              doc.customFieldsData.push({
                field: property.id,
                value: fieldValue[colIndex]
              });

              doc.customFieldsData = await sendFormsMessage({
                subdomain,
                action: 'fields.prepareCustomFieldsData',
                data: doc.customFieldsData,
                isRPC: true
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

              const owner = await sendCoreMessage({
                subdomain,
                action: 'users.findOne',
                data: {
                  email: userEmail
                },
                isRPC: true
              });

              doc.ownerId = owner ? owner._id : '';
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

          case 'companiesPrimaryEmails':
            {
              doc.companiesPrimaryEmails = value.split(',');
            }
            break;

          case 'customersPrimaryEmails':
            doc.customersPrimaryEmails = value.split(',');
            break;

          case 'vendorCode':
            doc.vendorCode = value;
            break;

          case 'tag':
            {
              const type = contentType === 'lead' ? 'customer' : contentType;

              const tagName = value;

              let tag = await sendTagsMessage({
                subdomain,
                action: 'findOne',
                data: { name: tagName, type: `contacts:${type}` },
                isRPC: true
              });

              if (!tag) {
                tag = await sendTagsMessage({
                  subdomain,
                  action: 'createTag',
                  data: { name: tagName, type: `contacts:${type}` },
                  isRPC: true
                });
              }

              doc.tagIds = tag ? [tag._id] : [];
            }

            break;

          case 'assignedUserEmail':
            {
              const assignedUser = await sendCoreMessage({
                subdomain,
                action: 'users.findOne',
                data: {
                  email: value
                },
                isRPC: true
              });

              doc.assignedUserIds = assignedUser ? [assignedUser._id] : [];
            }

            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === 'createdAt' && value) {
                doc.createdAt = new Date(value);
              }

              if (property.name === 'modifiedAt' && value) {
                doc.modifiedAt = new Date(value);
              }

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

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};

// tslint:disable-next-line
