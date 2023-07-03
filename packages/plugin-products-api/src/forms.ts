import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { EXTEND_FIELDS, PRODUCT_INFO } from './constants';

export default {
  types: [{ description: 'Products & services', type: 'product' }],
  fields: async ({ subdomain, data }) => {
    const { usageType } = data;
    const models = await generateModels(subdomain);

    const schema = models.Products.schema as any;

    let fields: Array<{
      _id: number;
      name: string;
      group?: string;
      label?: string;
      type?: string;
      validation?: string;
      options?: string[];
      selectOptions?: Array<{ label: string; value: string }>;
    }> = [];

    fields = EXTEND_FIELDS;

    if (schema) {
      fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

      for (const name of Object.keys(schema.paths)) {
        const path = schema.paths[name];

        if (path.schema) {
          fields = [
            ...fields,
            ...(await generateFieldsFromSchema(path.schema, `${name}.`))
          ];
        }
      }
    }

    if (usageType === 'export') {
      fields = [
        ...fields,
        { _id: Math.random(), name: 'subUoms.code', label: 'Sub Uom Code' },
        { _id: Math.random(), name: 'subUoms.name', label: 'Sub Uom Name' },
        {
          _id: Math.random(),
          name: 'subUoms.subratio',
          label: 'Sub Uoam Ratio'
        }
      ];
    }

    return fields;
  },

  systemFields: ({ data: { groupId } }) =>
    PRODUCT_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `products:product`,
      canHide: false,
      isDefinedByErxes: true
    })),

  groupsFilter: async ({ subdomain, data: { config } }) => {
    const { categoryId, isChosen } = config;
    if (!categoryId) {
      return {};
    }

    const models = await generateModels(subdomain);
    const category = await models.ProductCategories.findOne({
      _id: categoryId
    }).lean();

    const categories = await models.ProductCategories.find({
      order: { $regex: new RegExp(category.order) }
    }).lean();

    return {
      $and: [
        { contentType: 'products:product' },
        {
          $or: [
            {
              $and: [
                { 'config.categories': { $exists: true } },
                {
                  'config.categories': {
                    $in: categories.map(c => c._id)
                  }
                }
              ]
            },
            { 'config.categories': { $exists: false } },
            {
              'config.categories': {
                $size: 0
              }
            }
          ]
        }
      ]
    };
  }
};
