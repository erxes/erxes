import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels } from './connectionResolver';
import { EXTEND_FIELDS, POS_ORDER_INFO } from './contants';

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

    if (usageType === 'export') {
      fields = [
        ...fields,
        { _id: Math.random(), name: 'posOrder.id', label: 'posOrder Id' },
        {
          _id: Math.random(),
          name: 'posOrder.branchId',
          label: 'posOrder branchId'
        }
      ];
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
