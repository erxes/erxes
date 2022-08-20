import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { EXTEND_FIELDS, PRODUCT_INFO } from './constants';

export default {
  types: [{ description: 'Products & services', type: 'product' }],
  fields: async ({ subdomain }) => {
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
    }))
};
