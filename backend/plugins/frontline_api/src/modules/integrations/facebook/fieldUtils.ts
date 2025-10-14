import { generateFieldsFromSchema } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { generateFieldBotOptions } from '@/integrations/facebook/utils';

export const generateFacebookFields = async (models: IModels, data) => {
  const { collectionType } = data;
  const schemas = {
    messages: models.FacebookConversationMessages,
    comments: models.FacebookCommentConversation,
  };
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

  let { schema } = schemas[collectionType];

  fields = [];

  if (schema) {
    fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

    for (const name of Object.keys(schema.paths)) {
      const path = schema.paths[name];

      if (path.schema) {
        fields = [
          ...fields,
          ...(await generateFieldsFromSchema(path.schema, `${name}.`)),
        ];
      }
    }
  }

  fields = [
    ...fields,
    ...[
      {
        _id: Math.random(),
        name: 'content',
        label: 'Content',
        type: 'String',
      },
    ],
  ];

  fields = await generateFieldBotOptions(models, fields);

  const customerFields = await sendTRPCMessage({
    pluginName: 'core',
    method: 'query',
    module: 'fields',
    action: 'fieldsCombinedByContentType',
    input: {
      contentType: 'core:customer',
    },
    defaultValue: [],
  });

  fields = [
    ...fields,
    ...customerFields.map((field) => ({
      ...field,
      name: `customer.${field.name}`,
    })),
  ];

  return fields;
};
