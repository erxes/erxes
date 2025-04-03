import { generateModels } from './connectionResolver';
import { sendCoreMessage } from './messageBroker';

const IMPORT_EXPORT_TYPES = [
  {
    text: 'Accounts',
    contentType: 'account',
    icon: 'list'
  },
  {
    text: 'Account Categories',
    contentType: 'category',
    icon: 'list'
  }
];

const generateAccountsDocs = async (subdomain, result, properties) => {
  const models = await generateModels(subdomain);
  const bulkDoc: any = [];

  for (const fieldValue of result) {
    const doc: any = {
      customFieldData: []
    };

    let colIndex: number = 0;

    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();
      switch (property.name) {
        case 'categoryCode':
          {
            const category = await models.AccountCategories.findOne({
              code: value
            });
            doc.categoryId = category?._id || '';
          }

          break;
        case 'parentCode':
          {
            const code = (fieldValue[colIndex + 1] || '').toString();
            const parent = await models.Accounts.findOne({ code });
            doc.parentId = parent?._id || '';
          }
          break;
        case 'kind':
          if (['актив', 'Актив', 'active', 'Active', 'ACTIVE', '1', 1].includes(value)) {
            doc.kind = 'active'
          } else {
            doc.kind = 'passive'
          }
          break;
        case 'isTemp':
          if ([true, 'true', 'True', 'TRUE', '1', 1].includes(value)) {
            doc.isTemp = true;
          }
          break;
        case 'isOutBalance':
          if ([true, 'true', 'True', 'TRUE', '1', 1].includes(value)) {
            doc.isOutBalance = true;
          }
          break;
        case 'branch':
          if (value) {
            const branch = await sendCoreMessage({
              subdomain,
              action: 'branches.findOne',
              data: {
                $or: [{ code: value }, { title: value }],
              },
              isRPC: true,
              defaultValue: null,
            });
            doc.branchId = branch?._id
          }
          break;
        case 'department':
          if (value) {
            const department = await sendCoreMessage({
              subdomain,
              action: 'departments.findOne',
              data: {
                $or: [{ code: value }, { title: value }],
              },
              isRPC: true,
              defaultValue: null,
            });
            doc.departmentId = department?._id
          }
          break;
        default: {
          doc[property.name] = value;
          if (property.name === 'createdAt' && value) {
            doc.createdAt = new Date(value);
          }
        }
      }

      colIndex++;
    }

    if (!doc.unitPrice) {
      doc.unitPrice = 0;
    }

    const parent = await models.Accounts.findOne({ _id: doc.parentId });

    bulkDoc.push(doc);
  }
  return bulkDoc;
};


const generateCategoriesDocs = async (subdomain, result, properties) => {
  const models = await generateModels(subdomain);
  const bulkDoc: any = [];

  for (const fieldValue of result) {
    const doc: any = {
      customFieldData: []
    };

    let colIndex: number = 0;

    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();
      switch (property.name) {
        case 'parentCode':
          if (value) {
            const category = await models.AccountCategories.findOne({
              code: `${value}`
            });
            doc.parentId = category?._id || `!!!${value}`;
          }

          break;
        default: {
          doc[property.name] = value;
          if (property.name === 'createdAt' && value) {
            doc.createdAt = new Date(value);
          }
        }
      }

      colIndex++;
    }

    bulkDoc.push(doc);
  }
  return bulkDoc;
}

export default {
  importExportTypes: IMPORT_EXPORT_TYPES,

  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs, contentType, user } = data;

    let updated = 0;
    const objects: any = [];

    if (contentType === 'account') {
      try {
        for (const doc of docs) {
          if (doc.code) {
            const product = await models.Accounts.findOne({ code: doc.code });

            if (product) {
              await models.Accounts.updateAccount(product._id, { ...doc });
              updated++;
            } else {
              const insertedProduct = await models.Accounts.createAccount(doc);

              objects.push(insertedProduct);
            }
          } else {
            const insertedProduct = await models.Accounts.createAccount(doc);

            objects.push(insertedProduct);
          }
        }
        return { objects, updated: 0 };
      } catch (e) {
        return { error: e.message };
      }
    }

    if (contentType === 'category') {
      try {
        for (const doc of docs) {
          if (doc.parentId?.includes('!!!')) {
            const category = await models.AccountCategories.findOne({
              code: doc.parentId.replace('!!!', '')
            });
            doc.parentId = category?._id || '';
          }
          if (doc.code) {
            const category = await models.AccountCategories.findOne({ code: doc.code });

            if (category) {
              await models.AccountCategories.updateAccountCategory(
                category._id,
                { ...doc }
              );
              updated++;
            } else {
              const insertedCategory = await models.AccountCategories.createAccountCategory(doc);

              objects.push(insertedCategory);
            }
          } else {
            const insertedCategory = await models.AccountCategories.createAccountCategory(doc);

            objects.push(insertedCategory);
          }
        }
        return { objects, updated: 0 };
      } catch (e) {
        return { error: e.message };
      }
    }
  },

  prepareImportDocs: async ({ subdomain, data }) => {
    const { result, properties, contentType } = data;

    let bulkDoc: any = [];

    if (contentType === 'category') {
      bulkDoc = await generateCategoriesDocs(subdomain, result, properties)
    }

    if (contentType === 'account') {
      bulkDoc = await generateAccountsDocs(subdomain, result, properties);
    }

    return bulkDoc;
  }
};
