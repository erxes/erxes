import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { IModels, generateModels } from './connectionResolver';

const generateBotOptions = async (models: IModels, fields) => {
  const bots = await models.Bots.find({});

  const selectOptions: Array<{ label: string; value: any }> = bots.map(bot => ({
    value: bot._id,
    label: bot.name
  }));

  return fields.map(field =>
    field.name === 'botId' ? { ...field, selectOptions } : field
  );
};

const generateFields = async ({ subdomain, data }) => {
  const { type } = data;

  const models = await generateModels(subdomain);

  const { ConversationMessages, Comments } = models;

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
    case 'messages':
      schema = ConversationMessages.schema;
      break;

    case 'comments':
      schema = Comments.schema;
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

  fields = [
    ...fields,
    ...[
      { _id: Math.random(), name: 'content', label: 'Content', type: 'String' }
    ]
  ];

  fields = await generateBotOptions(models, fields);

  return fields;
};

export default {
  types: [
    { description: 'Facebook Messages', type: 'messages' },
    { description: 'Facebook Comments', type: 'comments' }
  ],
  fields: generateFields
};
