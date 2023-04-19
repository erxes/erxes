import * as _ from 'underscore';
import { generateModels } from './connectionResolver';
import { IMPORT_EXPORT_TYPES } from './constants';
import { generatePronoun } from './importUtils';
import {
  sendCoreMessage,
  sendFormsMessage,
  sendTagsMessage
} from './messageBroker';

export default {
  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { docs, user, contentType } = data;

    const objects: any = [];

    let updated: number = 0;

    const updateDocs: any = [];

    try {
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

          doc.state = contentType;

          const { profileScore, searchText } = await models.Customers.calcPSS(
            doc
          );

          doc.profileScore = profileScore;
          doc.searchText = searchText;
          doc.createdAt = new Date();
          doc.modifiedAt = new Date();

          if (doc.primaryEmail || doc.code) {
            const query = { $or: [] } as any;

            if (doc.primaryEmail) {
              query.$or.push({ primaryEmail: doc.primaryEmail });
            }
            if (doc.code) {
              query.$or.push({ code: doc.code });
            }

            const previousCustomer = await models.Customers.findOne(query);

            if (previousCustomer) {
              doc.createdAt = null;

              updated++;

              const updatedCustomer = await models.Customers.updateOne(
                { _id: previousCustomer._id },
                { $set: { ...doc } }
              );

              updateDocs.push(updatedCustomer);
            } else {
              const insertedCustomer = await models.Customers.create(doc);

              objects.push(insertedCustomer);
            }
          } else {
            const insertedCustomer = await models.Customers.create(doc);

            objects.push(insertedCustomer);
          }
        }
      }

      if (contentType === 'company') {
        for (const doc of docs) {
          if (!doc.ownerId && user) {
            doc.ownerId = user._id;
          }

          doc.searchText = models.Companies.fillSearchText(doc);
          doc.createdAt = new Date();
          doc.modifiedAt = new Date();

          if (doc.primaryEmail) {
            const previousCompany = await models.Companies.findOne({
              $or: [{ primaryEmail: doc.primaryEmail }]
            });

            if (previousCompany) {
              await models.Companies.updateOne(
                { _id: previousCompany._id },
                { $set: { ...doc } }
              );

              updated++;
            } else {
              const insertedCompany = await models.Companies.create(doc);

              objects.push(insertedCompany);
            }
          } else {
            const insertedCompany = await models.Companies.create(doc);

            objects.push(insertedCompany);
          }
        }
      }

      return { objects, updated };
    } catch (e) {
      return { error: e.message };
    }
  },
  importExportTypes: IMPORT_EXPORT_TYPES,
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
                isRPC: true,
                defaultValue: doc.customFieldsData,
                timeout: 60 * 1000 // 1 minute
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
