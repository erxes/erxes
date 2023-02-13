import { generateModels } from './connectionResolver';
import { sendContactsMessage, sendCoreMessage } from './messageBroker';

export const EXPORT_TYPES = [
  {
    text: 'Assets',
    contentType: 'asset',
    icon: 'piggy-bank'
  }
];

export const IMPORT_TYPES = [
  {
    text: ' Assets',
    contentType: 'asset',
    icon: 'piggybank'
  }
];

const generateAssetsDocs = async (subdomain, result, properties) => {
  const models = await generateModels(subdomain);
  const bulkDoc: any = [];

  for (const fieldValue of result) {
    const doc: any = {
      customFieldData: []
    };

    let colIndex: number = 0;
    let ratios = [];

    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();
      switch (property.name) {
        case 'customProperty':
          {
            doc.customFieldData.push({
              field: property.id,
              value: fieldValue[colIndex]
            });
          }
          break;
        case 'categoryName':
          {
            const category = await models.AssetCategories.findOne({
              name: { $regex: new RegExp(`^${value}$`, 'i') }
            });
            doc.categoryId = category ? category._id : '';
          }

          break;
        case 'parentName':
          {
            const parent = await models.Assets.findOne({
              name: { $regex: new RegExp(`^${value}$`, 'i') }
            });
            doc.parentId = parent ? parent._id : '';
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

    const parent = await models.Assets.findOne({ _id: doc.parentId });
    doc.order = parent ? `${parent.order}/${doc.code}` : `${doc.code}`;

    bulkDoc.push(doc);
  }
  return bulkDoc;
};

const generateAssetsMovementsDocs = async (subdomain, result, properties) => {
  const models = await generateModels(subdomain);
  const bulkDoc: any = {};

  const items: any[] = [];

  for (const fieldValue of result) {
    const item: any = {};

    let colIndex: number = 0;

    for (const property of properties) {
      const value = (fieldValue[colIndex] || '').toString();
      switch (property.name) {
        case 'assetName':
          {
            const code = (fieldValue[colIndex + 1] || '').toString();
            const asset = await models.Assets.findOne({
              name: { $regex: new RegExp(`^${value}$`, 'i') },
              code
            });

            item.assetId = asset ? asset._id : '';
          }
          break;
        case 'branchName':
          {
            const code = (fieldValue[colIndex + 1] || '').toString();
            const branch = await sendCoreMessage({
              subdomain,
              action: 'branches.findOne',
              data: {
                title: { $regex: `^${value}$`, $options: 'i' },
                code
              },
              isRPC: true,
              defaultValue: {}
            });

            item.branchId = branch ? branch._id : '';
          }
          break;
        case 'departmentName':
          {
            const code = (fieldValue[colIndex + 1] || '').toString();
            const department = await sendCoreMessage({
              subdomain,
              action: 'departments.findOne',
              data: {
                title: { $regex: `^${value}$`, $options: 'i' },
                code
              },
              isRPC: true,
              defaultValue: {}
            });

            item.departmentId = department ? department._id : '';
          }
          break;
        case 'teamMemberEmail':
          {
            const teamMember = await sendCoreMessage({
              subdomain,
              action: 'users.findOne',
              data: {
                email: { $regex: `^${value}$`, $options: 'i' }
              }
            });
            item.teamMemberId = teamMember ? teamMember._id : '';
          }
          break;
        case 'customerEmail':
          {
            const customer = await sendContactsMessage({
              subdomain,
              action: 'customers.find',
              data: {
                primaryEmail: { $regex: `^${value}$`, $options: 'i' }
              },
              isRPC: true,
              defaultValue: {}
            });

            item.customerId = customer ? customer._id : '';
          }
          break;
        case 'companyEmail':
          {
            const company = await sendContactsMessage({
              subdomain,
              action: 'companies.find',
              data: {
                primaryName: { $regex: `^${value}$`, $options: 'i' }
              },
              isRPC: true,
              defaultValue: {}
            });

            item.companyId = company ? company._id : '';
          }
          break;
      }

      colIndex++;
    }

    items.push(item);
  }

  for (const property of properties) {
    if (property.name === 'movedAt') {
      const index = properties.indexOf(property);

      const movedAt = result[0][index] || '';

      bulkDoc.movedAt = new Date(movedAt);
    }
    if (property.name === 'description') {
      const index = properties.indexOf(property);

      bulkDoc.description = result[0][index] || '';
    }
  }

  bulkDoc.items = items;

  return [bulkDoc];
};

export default {
  exportTypes: EXPORT_TYPES,
  importTypes: IMPORT_TYPES,

  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs, contentType, user } = data;

    if (contentType === 'asset') {
      try {
        const objects = await models.Assets.insertMany(docs);
        return { objects, updated: 0 };
      } catch (e) {
        return { error: e.message };
      }
    }

    if (contentType === 'assets-movement') {
      try {
        const movement = await models.Movements.movementAdd(docs[0], user._id);
        return { objects: [movement], updated: 0 };
      } catch (error) {
        return { error: error.message };
      }
    }
  },
  prepareImportDocs: async ({ subdomain, data }) => {
    const { result, properties, contentType } = data;

    let bulkDoc: any = [];

    if (contentType === 'asset') {
      bulkDoc = await generateAssetsDocs(subdomain, result, properties);
    }

    if (contentType === 'assets-movement') {
      bulkDoc = await generateAssetsMovementsDocs(
        subdomain,
        result,
        properties
      );
    }

    return bulkDoc;
  }
};
