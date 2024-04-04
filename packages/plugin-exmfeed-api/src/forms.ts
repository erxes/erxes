import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';

const generateFields = async ({ subdomain, data }) => {
  const { type, usageType } = data;

  const models = await generateModels(subdomain);

  const { ExmFeed, ExmThanks } = models;

  let schema: any;
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

  switch (type) {
    case 'feeds':
      schema = ExmFeed.schema;
      break;

    case 'thanks':
      schema = ExmThanks.schema;
      break;
  }

  fields = [];

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
};

export default {
  types: [
    { description: 'Exm feed', type: 'feed' },
    { description: 'Exm thanks', type: 'thanks' }
  ],
  fields: generateFields
};
