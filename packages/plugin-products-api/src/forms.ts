import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { IModels, generateModels } from './connectionResolver';
import { EXTEND_FIELDS, PRODUCT_INFO } from './constants';
import { escapeRegExp } from '@erxes/api-utils/src/core';
import { sendTagsMessage } from './messageBroker';

const getTags = async (subdomain: string) => {
  const tags = await sendTagsMessage({
    subdomain,
    action: 'find',
    data: {
      type: 'products:product',
    },
    isRPC: true,
    defaultValue: [],
  });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const tag of tags) {
    selectOptions.push({
      value: tag._id,
      label: tag.name,
    });
  }

  return {
    _id: Math.random(),
    name: 'tagIds',
    label: 'Tag',
    type: 'tag',
    selectOptions,
  };
};

const getCategories = async (models: IModels) => {
  const categories = await models.ProductCategories.find({}).sort({ order: 1 }).lean()

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const category of categories) {
    let step = (category.order || '/').split('/').length - 2;
    if (step < 0) step = 0;

    selectOptions.push({
      value: category._id,
      label: `${'.'.repeat(step)}${category.code} - ${category.name}`,
    });
  }

  return {
    _id: Math.random(),
    name: 'categoryId',
    label: 'Categories',
    type: 'category',
    selectOptions,
  };

}

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
    const tags = await getTags(subdomain);
    const categories = await getCategories(models);

    fields = [...fields, categories, tags];
    if (schema) {
      fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

      for (const name of Object.keys(schema.paths)) {
        const path = schema.paths[name];

        if (path.schema) {
          fields = [
            ...fields,
            ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
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
          label: 'Sub Uoam Ratio',
        },
      ];
    }

    if (['import', 'export'].includes(usageType)) {
      fields = [
        ...fields,
        {
          _id: Math.random(),
          name: 'categoryName',
          label: 'Category Name',
          type: 'string'
        }
      ]
    }

    return fields;
  },

  systemFields: ({ data: { groupId } }) =>
    PRODUCT_INFO.ALL.map((e) => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `products:product`,
      canHide: false,
      isDefinedByErxes: true,
    })),

  groupsFilter: async ({ subdomain, data: { config } }) => {
    const { categoryId, isChosen } = config;
    if (!categoryId) {
      return { contentType: 'products:product' };
    }

    const models = await generateModels(subdomain);
    const category = await models.ProductCategories.findOne({
      _id: categoryId,
    }).lean();
    if(!category) {
      throw new Error(`ProductCategory ${categoryId} not found`);
    }
    const categories = await models.ProductCategories.find({
      order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) },
    }).lean();

    // TODO: get recurcive parent

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
                    $in: categories.map((c) => c._id),
                  },
                },
              ],
            },
            { 'config.categories': { $exists: false } },
            {
              'config.categories': {
                $size: 0,
              },
            },
          ],
        },
      ],
    };
  },
};
