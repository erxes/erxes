import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { EXTEND_FIELDS, POS_ORDER_INFO } from './contants';
import { sendProductsMessage } from './messageBroker';

const generateProductsOptions = async (
  subdomain: string,
  name: string,
  label: string,
  type: string
) => {
  const products = await sendProductsMessage({
    subdomain,
    action: 'find',
    data: {
      query: {}
    },
    isRPC: true,
    defaultValue: []
  });

  return products.map(product => ({
    value: product._id,
    label: `${product.code} - ${product.name}`
  }));
};

export default {
  types: [{ description: 'Pos Order', type: 'pos' }],
  fields: async ({ subdomain, data }) => {
    const { usageType } = data;
    const models = await generateModels(subdomain);

    const schema = models.PosOrders.schema as any;

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

    if (fields.find(field => field.name === 'items.productId')) {
      const productOptions = await generateProductsOptions(
        subdomain,
        'items.productId',
        'Product',
        'product'
      );

      fields = fields.map(field =>
        field.name === 'items.productId'
          ? { ...field, selectOptions: productOptions }
          : field
      );
    }

    return fields;
  },

  systemFields: ({ data: { groupId, type } }) =>
    POS_ORDER_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      field: e.field,
      canHide: false,
      groupId,
      contentType: `pos:pos`,
      isDefinedByErxes: true
    }))
};
