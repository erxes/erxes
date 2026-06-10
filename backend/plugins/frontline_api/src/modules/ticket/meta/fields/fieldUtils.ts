import { generateFieldsFromSchema } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { generateModels, IModels } from '~/connectionResolvers';
import {
  TICKET_PRIORITY_TYPES,
  TICKET_STATUS_TYPES,
} from '~/modules/ticket/constants/types';

type TSelectOption = {
  label: string;
  value: string | number;
};

type TSelectionConfig = {
  queryName: string;
  labelField: string;
  valueField?: string;
  multi?: boolean;
};

type TTicketField = {
  _id: string | number;
  name: string;
  group?: string;
  label?: string;
  type?: string;
  validation?: string;
  options?: TSelectOption[];
  selectOptions?: TSelectOption[];
  configs?: TSelectionConfig;
  selectionConfig?: TSelectionConfig;
};

type TGenerateTicketFieldsData = {
  collectionType?: string;
  config?: Record<string, unknown>;
};

type TTag = {
  _id?: unknown;
  name?: unknown;
};

const TICKET_FIELD_NAMES_WITH_OPTIONS = new Set([
  'channelId',
  'pipelineId',
  'statusId',
  'statusType',
  'priority',
  'assigneeId',
  'createdBy',
  'userId',
  'tagIds',
  'companyIds',
]);

const toStringValue = (value: unknown): string | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  const stringValue = String(value).trim();

  return stringValue || undefined;
};

const toOption = (
  value: unknown,
  label: unknown,
): TSelectOption | undefined => {
  const optionValue = toStringValue(value);
  const optionLabel = toStringValue(label) || optionValue;

  return optionValue && optionLabel
    ? { value: optionValue, label: optionLabel }
    : undefined;
};

const isTag = (value: unknown): value is TTag =>
  Boolean(value && typeof value === 'object');

const withStaticOptions = ({
  name,
  label,
  type,
  options,
}: {
  name: string;
  label: string;
  type: string;
  options: TSelectOption[];
}): TTicketField => ({
  _id: name,
  name,
  label,
  type,
  options,
  selectOptions: options,
});

const withQueryConfig = ({
  name,
  label,
  type,
  configs,
}: {
  name: string;
  label: string;
  type: string;
  configs: TSelectionConfig;
}): TTicketField => ({
  _id: name,
  name,
  label,
  type,
  configs,
  selectionConfig: configs,
});

const normalizeField = (field: TTicketField): TTicketField => {
  if (field.options || !field.selectOptions) {
    return field;
  }

  return {
    ...field,
    options: field.selectOptions,
  };
};

const generateUsersOptions = (name: string, label: string, multi = false) =>
  withQueryConfig({
    name,
    label,
    type: 'user',
    configs: {
      queryName: 'users',
      labelField: 'email',
      multi,
    },
  });

const generateCompaniesOptions = () =>
  withQueryConfig({
    name: 'companyIds',
    label: 'Companies',
    type: 'contact',
    configs: {
      queryName: 'companies',
      labelField: 'primaryName',
      multi: true,
    },
  });

const getChannelOptions = async (models: IModels) => {
  const channels = await models.Channels.find({}).sort({ name: 1 }).lean();
  const options = channels
    .map((channel) => toOption(channel._id, channel.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'channelId',
    label: 'Channel',
    type: 'channel',
    options,
  });
};

const getPipelineOptions = async (models: IModels, channelId?: string) => {
  const selector = channelId ? { channelId } : {};
  const pipelines = await models.Pipeline.find(selector)
    .sort({ name: 1 })
    .lean();
  const options = pipelines
    .map((pipeline) => toOption(pipeline._id, pipeline.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'pipelineId',
    label: 'Pipeline',
    type: 'pipeline',
    options,
  });
};

const getStatusOptions = async (models: IModels, pipelineId?: string) => {
  const selector = pipelineId ? { pipelineId } : {};
  const statuses = await models.Status.find(selector)
    .sort({ pipelineId: 1, order: 1, name: 1 })
    .lean();
  const options = statuses
    .map((status) => toOption(status._id, status.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'statusId',
    label: 'Status',
    type: 'status',
    options,
  });
};

const getStatusTypeOptions = () =>
  withStaticOptions({
    name: 'statusType',
    label: 'Status type',
    type: 'Number',
    options: Object.entries(TICKET_STATUS_TYPES).map(([label, value]) => ({
      value,
      label: label
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' '),
    })),
  });

const getPriorityOptions = () =>
  withStaticOptions({
    name: 'priority',
    label: 'Priority',
    type: 'Number',
    options: [
      { value: 0, label: 'No Priority' },
      ...TICKET_PRIORITY_TYPES.map((priority) => ({
        value: priority.type,
        label: priority.name.charAt(0).toUpperCase() + priority.name.slice(1),
      })),
    ],
  });

const generateTagOptions = async (subdomain: string) => {
  const tags = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    module: 'tags',
    action: 'find',
    input: {
      type: 'frontline:ticket',
    },
    defaultValue: [],
  });
  const tagList = Array.isArray(tags) ? tags.filter(isTag) : [];
  const options = tagList
    .map((tag) => toOption(tag._id, tag.name))
    .filter((option): option is TSelectOption => Boolean(option));

  return withStaticOptions({
    name: 'tagIds',
    label: 'Tags',
    type: 'tags',
    options,
  });
};

const getSchemaFields = async (models: IModels) => {
  const schema = models.Ticket.schema;
  let fields: TTicketField[] = [];

  if (!schema) {
    return fields;
  }

  fields = [
    ...(await generateFieldsFromSchema(schema, '')).map(normalizeField),
    ...fields,
  ];

  for (const name of Object.keys(schema.paths)) {
    const path = schema.paths[name];

    if (path.schema) {
      fields = [
        ...fields,
        ...(await generateFieldsFromSchema(path.schema, `${name}.`)).map(
          normalizeField,
        ),
      ];
    }
  }

  return fields.filter(
    (field) => !TICKET_FIELD_NAMES_WITH_OPTIONS.has(field.name),
  );
};

export const generateTicketFields = async ({
  subdomain,
  data,
}: {
  subdomain: string;
  data: TGenerateTicketFieldsData;
}) => {
  const models = await generateModels(subdomain);
  const { collectionType, config = {} } = data;

  if (collectionType && collectionType !== 'tickets') {
    return [];
  }

  const channelId = toStringValue(config.channelId);
  const pipelineId = toStringValue(config.pipelineId);

  return [
    ...(await getSchemaFields(models)),
    await getChannelOptions(models),
    await getPipelineOptions(models, channelId),
    await getStatusOptions(models, pipelineId),
    getStatusTypeOptions(),
    getPriorityOptions(),
    generateUsersOptions('assigneeId', 'Assignee'),
    generateUsersOptions('createdBy', 'Created by'),
    generateUsersOptions('userId', 'User ID'),
    generateCompaniesOptions(),
    await generateTagOptions(subdomain),
  ];
};
