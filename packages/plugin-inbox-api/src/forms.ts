import { generateFieldsFromSchema } from '@erxes/api-utils/src';
import { generateModels, IModels } from './connectionResolver';
import { CONVERSATION_INFO } from './constants';
import { sendTagsMessage } from './messageBroker';

const getTags = async (subdomain: string) => {
  const tags = await sendTagsMessage({
    subdomain,
    action: 'find',
    data: {
      type: `inbox:conversation`
    },
    isRPC: true,
    defaultValue: []
  });

  const selectOptions: Array<{ label: string; value: any }> = [];

  for (const tag of tags) {
    selectOptions.push({
      value: tag._id,
      label: tag.name
    });
  }

  return {
    _id: Math.random(),
    name: 'tagIds',
    label: 'Tag',
    type: 'tag',
    selectOptions
  };
};

const getIntegrations = async (models: IModels) => {
  const selectOptions = await models.Integrations.aggregate([
    {
      $project: {
        _id: 0,
        label: '$name',
        value: '$_id'
      }
    }
  ]);

  return {
    _id: Math.random(),
    name: 'relatedIntegrationIds',
    label: 'Related integration',
    selectOptions
  };
};

const generateFields = async ({ subdomain }) => {
  const models = await generateModels(subdomain);

  const schema: any = models.Conversations.schema;

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

  // generate list using customer or company schema
  fields = [...fields, ...(await generateFieldsFromSchema(schema, ''))];

  const tags = await getTags(subdomain);
  const integrations = await getIntegrations(models);

  fields = [...fields, tags, integrations];

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

  return fields;
};

export default {
  types: [
    {
      description: 'Conversation details',
      type: 'conversation'
    }
  ],
  fields: generateFields,
  systemFields: ({ data: { groupId } }) =>
    CONVERSATION_INFO.ALL.map(e => ({
      text: e.label,
      type: e.field,
      groupId,
      contentType: `inbox:conversation`,
      isDefinedByErxes: true
    }))
};
