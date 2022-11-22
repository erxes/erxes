import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { ASSET_INFO, EXTEND_FIELDS } from './common/constant/asset';
import { generateModels } from './connectionResolver';

export default {
  types: [{ description: 'Assets', type: 'asset' }],
  fields: async ({ subdomain }) => {
    const models = await generateModels(subdomain);

    const schema = models.Assets.schema as any;

    let fields: Array<{
      _id: number;
      name: string;
      category?: string;
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

  systemFields: ({ data: { categoryId } }) =>
    ASSET_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      categoryId,
      contentType: `assets:asset`,
      canHide: false,
      isDefinedByErxes: true
    })),
  extraFieldTypes: [
    {
      value: 'asset',
      label: 'Asset'
    }
  ]
};
