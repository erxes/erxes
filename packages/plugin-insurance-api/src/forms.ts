import { generateFieldsFromSchema } from '@erxes/api-utils/src/fieldUtils';
import { generateModels } from './connectionResolver';

const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { Items } = models;

  const schema = Items.schema as any;
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

  return fields;
};

export default {
  types: [
    {
      description: 'Insurance item',
      type: 'item'
    }
  ],
  fields: generateFields,
  defaultColumnsConfig: {},
  systemFields: {},
  systemFieldsAvailable: false
};
