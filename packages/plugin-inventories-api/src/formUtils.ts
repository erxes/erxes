import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import * as _ from 'underscore';
import { generateModels } from './connectionResolver';

export const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const { SafeRemainders } = models;

  const schema = SafeRemainders.schema as any;
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
    // generate list using customer or company schema
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      // extend fields list using sub schema fields
      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  return fields;
};
