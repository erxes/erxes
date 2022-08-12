import { generateModels } from './connectionResolver';
import { sendFormsMessage, sendTagsMessage } from './messageBroker';

export const EXPORT_TYPES = [
  {
    text: 'Product & Services',
    contentType: 'product',
    icon: 'server-alt'
  }
];

export const IMPORT_TYPES = [
  {
    text: 'Product & Services',
    contentType: 'product',
    icon: 'server-alt'
  }
];

export default {
  exportTypes: EXPORT_TYPES,
  importTypes: IMPORT_TYPES,

  insertImportItems: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { docs } = data;

    try {
      const objects = await models.Products.insertMany(docs);
      return { objects, updated: 0 };
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
                isRPC: true
              });
            }
            break;

          case 'categoryName':
            {
              const category = await models.ProductCategories.findOne({
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
                data: { name: tagName, type: `products:product` },
                isRPC: true
              });

              if (!tag) {
                tag = await sendTagsMessage({
                  subdomain,
                  action: 'createTag',
                  data: { name: tagName, type: `products:product` },
                  isRPC: true
                });
              }

              doc.tagIds = tag ? [tag._id] : [];
            }

            break;

          case 'subUoms.uomId':
            {
              subUomNames = value.split(',');
            }
            break;

          case 'subUoms.ratio':
            {
              ratios = value.split(',');
            }
            break;

          case 'uomId':
            {
              const uom = await models.Uoms.findOne({
                $or: [{ name: value }, { code: value }]
              }).lean();
              doc.uomId = uom ? uom._id : '';
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

      let ind = 0;
      const subUoms: any = [];

      for (const uomVal of subUomNames) {
        const uom = await models.Uoms.findOne({
          $or: [{ name: uomVal }, { code: uomVal }]
        }).lean();
        if (!uom) {
          ind += 1;
          continue;
        }

        subUoms.push({
          id: Math.random(),
          uomId: uom._id,
          ratio: Number(ratios[ind])
        });
        ind += 1;
      }
      doc.subUoms = subUoms;

      bulkDoc.push(doc);
    }

    return bulkDoc;
  }
};
