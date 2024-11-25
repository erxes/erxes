import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';
const IMPORT_EXPORT_TYPES = [
  {
    text: 'Reminders',
    contentType: 'inventories',
    icon: 'server-alt',
    skipFilter: false,
  },
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
          const product = await models.SafeRemainders.findOne({
            code: doc.code,
          });

          if (product) {
            delete doc.code;
            await models.SafeRemainders.updateOne(
              { _id: product._id },
              { $set: { ...doc } }
            );
            updated++;
          } else {
            const insertedProduct = await models.SafeRemainders.create(doc);

            objects.push(insertedProduct);
          }
        } else {
          const insertedProduct = await models.SafeRemainders.create(doc);

          objects.push(insertedProduct);
        }
      }

      return { objects, updated };
    } catch (e) {
      return { error: e.message };
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const { result, properties, user } = data;

    const bulkDoc: any = [];

    // Iterating field values
    for (const fieldValue of result) {
      const doc: any = {};

      let colIndex: number = 0;

      // Iterating through detailed properties
      for (const property of properties) {
        const value = (fieldValue[colIndex] || '').toString();

        switch (property.name) {
          case 'productCategoryId':
            {
              const categoryName = value;

              const category = await sendCoreMessage({
                subdomain,
                action: 'categories.findOne',
                data: {
                  name: { $regex: `^${categoryName}$`, $options: 'i' },
                },
                isRPC: true,
                defaultValue: {},
              });

              doc.productCategoryId = category ? category._id : '';
            }

            break;

          case 'branchId':
            {
              const branchtTitle = value;

              const branch = await sendCoreMessage({
                subdomain,
                action: 'branches.findOne',
                data: {
                  query: {
                    title: { $regex: `^${branchtTitle}$`, $options: 'i' },
                  },
                },
                isRPC: true,
                defaultValue: [],
              });

              doc.branchId = branch ? branch._id : '';
            }
            break;

          case 'departmentId':
            {
              const departmentTitles = value;

              const department = await sendCoreMessage({
                subdomain,
                action: 'departments.findOne',
                data: {
                  title: { $regex: `^${departmentTitles}$`, $options: 'i' },
                },
                isRPC: true,
                defaultValue: {},
              });

              doc.departmentId = department ? department._id : 'department';
            }
            break;

          default:
            {
              doc[property.name] = value;

              if (property.name === 'status') {
                doc.status = 'draft';
              }
            }
            break;
        }

        colIndex++;
      }

      bulkDoc.push(doc);
    }

    return bulkDoc;
  },
};
