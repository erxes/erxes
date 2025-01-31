import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { generateModels } from './connectionResolver';

export const generateFields = async ({ subdomain, data }) => {
  const { type, usageType } = data;

  const models = await generateModels(subdomain);

  const { Posts } = models;

  let schema: any;

  switch (type) {
    case 'post':
      schema = Posts.schema;
      break;
  }

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

  if (schema) {
    if (schema) {
      // generate list using customer or company schema
      fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

      for (const name of Object.keys(schema.paths)) {
        const path = schema.paths[name];

        // extend fields list using sub schema fields
        if (path.schema) {
          fields = [
            ...fields,
            ...(await generateFieldsFromSchema(path.schema, `${name}.`))
          ];
        }
      }
    }
  }

  return fields;
};

export default {
  types: [
    {
      description: 'CMS Post',
      type: 'post'
    },
  ],
  fields: generateFields,
  defaultColumnsConfig: {},
  systemFields: () => [],
  systemFieldsAvailable: false
};
