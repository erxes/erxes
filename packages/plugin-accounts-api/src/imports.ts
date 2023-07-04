import { generateModels } from './connectionResolver';
import { sendFormsMessage, sendTagsMessage } from './messageBroker';

export const IMPORT_EXPORT_TYPES = [
  {
    text: 'Account',
    contentType: 'account',
    icon: 'server-alt'
  }
];
export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs } = data;

    let updated = 0;
    const objects: any = [];

    try {
      for (const doc of docs) {
        if (doc.code) {
          const account = await models.Accounts.findOne({ code: doc.code });

          if (account) {
            delete doc.code;
            await models.Accounts.updateOne(
              { _id: account._id },
              { $set: { ...doc } }
            );
            updated++;
          } else {
            const insertedAccount = await models.Accounts.create(doc);

            objects.push(insertedAccount);
          }
        } else {
          const insertedAccount = await models.Accounts.create(doc);

          objects.push(insertedAccount);
        }
      }

      return { objects, updated };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { result, properties } = data;

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {
        customFieldsData: []
      };

      let colIndex: number = 0;
      let barcodes = [];
      let subUomNames = [];
      let ratios = [];

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || '').toString();

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

          case 'categoryName':
            {
              const category = await models.AccountCategories.findOne({
                name: { $regex: new RegExp(`^${value}$`, 'i') }
              });

              doc.categoryId = category ? category._id : '';
            }

            break;

          case 'tag':
            {
              const tagName = value;

              let tag = await sendTagsMessage({
                subdomain,
                action: 'findOne',
                data: { name: tagName, type: `accounts:account` },
                isRPC: true
              });

              if (!tag) {
                tag = await sendTagsMessage({
                  subdomain,
                  action: 'createTag',
                  data: { name: tagName, type: `accounts:account` },
                  isRPC: true
                });
              }

              doc.tagIds = tag ? [tag._id] : [];
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

              if (property.name === 'isComplete') {
                doc.isComplete = Boolean(value);
              }
            }
            break;
        }

        colIndex++;
      }

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};
