import {
  replaceOutputPlaceholders,
  TAutomationProducers,
  TAutomationProducersInput,
} from 'erxes-api-shared/core-modules';
import { graphqlPubsub, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITicket } from '~/modules/ticket/@types/ticket';

type TReceiveActionInput =
  TAutomationProducersInput[TAutomationProducers.RECEIVE_ACTIONS];
type TTicketPropertiesData = NonNullable<ITicket['propertiesData']>;
type TTicketPropertyValue = TTicketPropertiesData[string];

type TCreateTicketActionParams = {
  models: IModels;
  subdomain: string;
  action: TReceiveActionInput['action'];
  execution: TReceiveActionInput['execution'];
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getString = (
  data: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = data[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  const stringValue = String(value).trim();

  return stringValue || undefined;
};

const getNumber = (
  data: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = data[key];

  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

const toStringArray = (value: unknown): string[] | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : String(value).split(',');
  const ids = values
    .map((item) => String(item).trim())
    .filter((item) => item.length > 0);

  return ids.length ? ids : undefined;
};

const parseDate = (value: unknown): Date | undefined => {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value;
  }

  const date = new Date(String(value));

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const toPropertyValue = (value: unknown): TTicketPropertyValue | undefined => {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    const values = value.filter(
      (item): item is string | number | boolean | Date =>
        typeof item === 'string' ||
        typeof item === 'number' ||
        typeof item === 'boolean' ||
        item instanceof Date,
    );

    return values.length ? values : undefined;
  }

  return undefined;
};

const normalizePropertiesData = (
  data: Record<string, unknown>,
): TTicketPropertiesData | undefined => {
  const propertyFieldKeys = Object.keys(data).filter((key) =>
    key.startsWith('propertiesData.'),
  );

  const sourcePropertiesData = toRecord(data.propertiesData);
  const propertiesData: TTicketPropertiesData = {};

  for (const [key, value] of Object.entries(sourcePropertiesData)) {
    const propertyValue = toPropertyValue(value);

    if (propertyValue !== undefined) {
      propertiesData[key] = propertyValue;
    }
  }

  for (const fieldKey of propertyFieldKeys) {
    const fieldId = fieldKey.replace('propertiesData.', '');
    const propertyValue = toPropertyValue(data[fieldKey]);

    if (propertyValue !== undefined) {
      propertiesData[fieldId] = propertyValue;
    }
  }

  return Object.keys(propertiesData).length ? propertiesData : undefined;
};

const getAutomationUserId = (
  data: Record<string, unknown>,
  target: Record<string, unknown>,
) =>
  getString(data, 'createdBy') ||
  getString(data, 'userId') ||
  getString(target, 'userId') ||
  getString(target, 'createdBy');

const buildTicketDoc = (data: Record<string, unknown>): ITicket => {
  const name = getString(data, 'name') || getString(data, 'cardName');
  const channelId = getString(data, 'channelId');
  const statusId = getString(data, 'statusId');

  if (!name) {
    throw new Error('Ticket name is required');
  }

  if (!channelId) {
    throw new Error('Ticket channel is required');
  }

  if (!statusId) {
    throw new Error('Ticket status is required');
  }

  return {
    name,
    channelId,
    statusId,
    pipelineId: getString(data, 'pipelineId') || '',
    stageId: getString(data, 'stageId') || '',
    description: getString(data, 'description'),
    priority: getNumber(data, 'priority'),
    assigneeId: getString(data, 'assigneeId') || getString(data, 'assignedTo'),
    userId: getString(data, 'userId'),
    labelIds: toStringArray(data.labelIds),
    tagIds: toStringArray(data.tagIds),
    companyIds: toStringArray(data.companyIds),
    startDate: parseDate(data.startDate),
    targetDate: parseDate(data.targetDate),
    propertiesData: normalizePropertiesData(data),
  };
};

export const createTicketAction = async ({
  models,
  subdomain,
  action,
  execution,
}: TCreateTicketActionParams) => {
  const resolvedConfig = await replaceOutputPlaceholders({
    subdomain,
    execution,
    values: toRecord(action.config),
    defaultValue: '',
  });
  const target = toRecord(execution.target);
  const userId = getAutomationUserId(resolvedConfig, target);

  if (!userId) {
    throw new Error('Ticket automation requires a user to create ticket');
  }

  const doc = buildTicketDoc(resolvedConfig);

  if (doc.propertiesData) {
    doc.propertiesData = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'mutation',
      module: 'fields',
      action: 'validateFieldValues',
      input: { data: doc.propertiesData },
      defaultValue: doc.propertiesData,
    });
  }

  const ticket = await models.Ticket.addTicket(doc, userId, subdomain);

  graphqlPubsub.publish(`ticketChanged:${ticket._id}`, {
    ticketChanged: { type: 'create', ticket },
  });
  graphqlPubsub.publish('ticketListChanged', {
    ticketListChanged: { type: 'create', ticket },
  });

  return {
    targetId: ticket._id,
    name: ticket.name,
    number: ticket.number,
    channelId: ticket.channelId,
    pipelineId: ticket.pipelineId,
    statusId: ticket.statusId,
    priority: ticket.priority,
    assigneeId: ticket.assigneeId,
  };
};
