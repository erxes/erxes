import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';

export default {
  types: [{ description: 'Saving Contact', type: 'contract' }],
  fields: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const schema = models.Contracts.schema as any;

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
    [
      { field: 'number', label: 'Number' },
      { field: 'status', label: 'Status' },
      { field: 'description', label: 'Description' },
      { field: 'savingAmount', label: 'SavingAmount' },
      { field: 'duration', label: 'Duration' },
      { field: 'interestRate', label: 'Interest rate' },
      { field: 'repayment', label: 'Repayment' },
      { field: 'startDate', label: 'Start date' },
      { field: 'scheduleDays', label: 'Schedule days' }
    ].map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `savings:contract`,
      canHide: false,
      isDefinedByErxes: true
    }))
};
