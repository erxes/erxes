import { generateModels } from './connectionResolver';

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

export default {
  exportTypes: EXPORT_TYPES,
  importTypes: IMPORT_TYPES,

  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs } = data;

    try {
      const objects = await models.Assets.insertMany(docs);
      return { objects, updated: 0 };
    } catch (e) {
      return { error: e.message };
    }
  },
  prepareImportDocs: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);
    const { result, properties } = data;

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
  }
};
