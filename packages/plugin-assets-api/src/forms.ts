import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import {
  ASSET_INFO,
  ASSETS_MOVEMENT_EXTEND_FIELDS,
  ASSET_EXTEND_FIELDS
} from './common/constant/asset';
import { generateModels } from './connectionResolver';

export default {
  types: [
    { description: 'Assets', type: 'asset' },
    { description: 'Assets-Movements', type: 'assets-movements' }
  ],
  fields: async ({ subdomain, data }) => {
    const models = await generateModels(subdomain);

    const { usageType, type } = data;

    let schema: any;

    switch (type) {
      case 'assets-movement':
        schema = models.Movements.schema as any;
        break;
      case 'asset':
        schema = models.Assets.schema as any;
        break;
    }

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

    if (usageType && usageType === 'import' && type === 'asset') {
      fields = ASSET_EXTEND_FIELDS;
    }

    if (usageType && usageType === 'import' && type === 'assets-movement') {
      fields = ASSETS_MOVEMENT_EXTEND_FIELDS;
    }

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
    },
    {
      value: 'asset-movement',
      label: 'Asset-Movement'
    }
  ]
};
