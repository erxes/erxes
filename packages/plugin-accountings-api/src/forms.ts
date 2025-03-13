import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import * as _ from 'underscore';
import { generateModels } from './connectionResolver';

export const generateFields = async ({ subdomain, data }) => {
  const { usageType, type } = data;
  const models = await generateModels(subdomain);
  const { AccountCategories, Accounts } = models;

  let schema: any;

  switch (type) {
    case 'category':
      schema = AccountCategories.schema;
      break;
    case 'account':
    default:
      schema = Accounts.schema;
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

  if (usageType === 'import') {
    fields = fields.filter(f => !['Created at', 'Order', 'Parent', 'Category'].includes(f.label || ''));

    fields = [...fields,
    {
      _id: Math.random(),
      name: "parentCode",
      label: "Parent Code",
      type: "string"
    }]

    if (type === 'account') {
      fields = [...fields,
        {
          _id: Math.random(),
          name: "categoryCode",
          label: "Category Code",
          type: "string"
        }]
    }
  }


  return fields;
};

export default {
  types: [
    {
      description: 'Accounts',
      type: 'account',
    },
    {
      description: 'Account Categories',
      type: 'accountCategory',
    },
  ],
  fields: generateFields,
};
