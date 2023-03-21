import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { USER_EXTENDED_FIELDS, USER_PROPERTIES_INFO } from './constants';

const generateFields = async ({ subdomain, data }) => {
  const models = await generateModels(subdomain);
  const { usageType } = data;

  const { Users } = models;

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

  schema = Users.schema;

  if (usageType && usageType === 'import') {
    fields = USER_EXTENDED_FIELDS;
  }

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

  return fields;
};

export default {
  types: [
    {
      description: 'Team member',
      type: 'user'
    }
  ],
  fields: generateFields,
  systemFields: ({ data: { groupId } }) =>
    USER_PROPERTIES_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `core:user`,
      isDefinedByErxes: true
    })),
  systemFieldsAvailable: true
};
