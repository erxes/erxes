import { FilterQuery, UpdateQuery } from 'mongoose';
import { visibleChannelsFilter } from '@/channel/utils';
import { IContext, IModels } from '~/connectionResolvers';

export enum ChannelResourceType {
  INTEGRATION = 'integration',
  PIPELINE = 'pipeline',
  FORM = 'form',
  SURVEY = 'survey',
  RESPONSE_TEMPLATE = 'responseTemplate',
}

type ChannelResourceModelKey =
  | 'Integrations'
  | 'Pipeline'
  | 'Forms'
  | 'Surveys'
  | 'ResponseTemplates';

export interface IChannelResourceDefinition {
  modelKey: ChannelResourceModelKey;
  nameField: 'name' | 'title';
  permission: string;
  label: string;
  labelPlural: string;
}

export const CHANNEL_RESOURCE_DEFINITIONS: Record<
  ChannelResourceType,
  IChannelResourceDefinition
> = {
  [ChannelResourceType.INTEGRATION]: {
    modelKey: 'Integrations',
    nameField: 'name',
    permission: 'integrationsEdit',
    label: 'integration',
    labelPlural: 'integrations',
  },
  [ChannelResourceType.PIPELINE]: {
    modelKey: 'Pipeline',
    nameField: 'name',
    permission: 'updateTicket',
    label: 'ticket pipeline',
    labelPlural: 'ticket pipelines',
  },
  [ChannelResourceType.FORM]: {
    modelKey: 'Forms',
    nameField: 'name',
    permission: 'formsEdit',
    label: 'form',
    labelPlural: 'forms',
  },
  [ChannelResourceType.SURVEY]: {
    modelKey: 'Surveys',
    nameField: 'title',
    permission: 'surveyEdit',
    label: 'survey',
    labelPlural: 'surveys',
  },
  [ChannelResourceType.RESPONSE_TEMPLATE]: {
    modelKey: 'ResponseTemplates',
    nameField: 'name',
    permission: 'responseTemplatesEdit',
    label: 'response template',
    labelPlural: 'response templates',
  },
};

interface IChannelResourceDoc {
  _id: string;
  channelId?: string;
  name?: string;
  title?: string;
  integrationId?: string;
}

interface IChannelResourceCollection {
  find(filter: FilterQuery<IChannelResourceDoc>): {
    lean(): Promise<IChannelResourceDoc[]>;
  };
  updateMany(
    filter: FilterQuery<IChannelResourceDoc>,
    update: UpdateQuery<IChannelResourceDoc>,
  ): Promise<unknown>;
}

export interface IMovableResource {
  _id: string;
  channelId: string;
  name: string;
}

export interface IChannelMoveResourcesArgs {
  resourceType: ChannelResourceType;
  resourceIds: string[];
  sourceChannelId: string;
  targetChannelId: string;
}

export interface IChannelMoveResourcesResult {
  movedIds: string[];
  movedCount: number;
  sourceChannelId: string;
  targetChannelId: string;
  targetChannelName: string;
}

export const isChannelResourceType = (
  value: string,
): value is ChannelResourceType =>
  Object.values(ChannelResourceType).includes(value as ChannelResourceType);

export const validateChannelMove = ({
  definition,
  sourceChannelId,
  targetChannelId,
  resourceIds,
  resources,
  conflictingNames,
}: {
  definition: IChannelResourceDefinition;
  sourceChannelId: string;
  targetChannelId: string;
  resourceIds: string[];
  resources: IMovableResource[];
  conflictingNames: string[];
}): void => {
  const { label, labelPlural } = definition;

  if (!targetChannelId) {
    throw new Error('Select a destination channel.');
  }

  if (!sourceChannelId) {
    throw new Error('The current channel is unknown.');
  }

  if (sourceChannelId === targetChannelId) {
    throw new Error(
      `The destination channel must be different from the current one.`,
    );
  }

  if (!resourceIds.length) {
    throw new Error(`Select at least one ${label} to move.`);
  }

  const foundIds = new Set(resources.map((resource) => resource._id));
  const missingIds = resourceIds.filter((id) => !foundIds.has(id));

  if (missingIds.length) {
    throw new Error(
      `${missingIds.length} of the selected ${labelPlural} no longer exist.`,
    );
  }

  const outsideSource = resources.filter(
    (resource) => resource.channelId !== sourceChannelId,
  );

  if (outsideSource.length) {
    throw new Error(
      `${outsideSource.length} of the selected ${labelPlural} are no longer in this channel. Reload the page and try again.`,
    );
  }

  if (conflictingNames.length) {
    throw new Error(
      `The destination channel already has a ${label} named "${conflictingNames[0]}". Rename it before moving.`,
    );
  }
};

const resourceCollection = (
  models: IModels,
  definition: IChannelResourceDefinition,
): IChannelResourceCollection =>
  models[definition.modelKey] as unknown as IChannelResourceCollection;

const readChannels = async (
  models: IModels,
  subdomain: string,
  user: IContext['user'],
  channelIds: string[],
) => {
  const filter = await visibleChannelsFilter({ models, subdomain, user });

  return models.Channels.find({
    $and: [{ _id: { $in: channelIds } }, filter],
  }).lean();
};

const cascadeMove = async (
  models: IModels,
  resourceType: ChannelResourceType,
  resources: IMovableResource[],
  targetChannelId: string,
): Promise<void> => {
  const resourceIds = resources.map((resource) => resource._id);

  if (resourceType === ChannelResourceType.PIPELINE) {
    await models.Ticket.updateMany(
      { pipelineId: { $in: resourceIds } },
      { $set: { channelId: targetChannelId } },
    );
    return;
  }

  if (resourceType === ChannelResourceType.FORM) {
    const integrationIds: string[] = await models.Forms.distinct(
      'integrationId',
      {
        _id: { $in: resourceIds },
        integrationId: { $exists: true, $nin: [null, ''] },
      },
    );

    if (integrationIds.length) {
      await models.Integrations.updateMany(
        { _id: { $in: integrationIds } },
        { $set: { channelId: targetChannelId } },
      );
    }
  }
};

export const moveChannelResources = async (
  {
    resourceType,
    resourceIds,
    sourceChannelId,
    targetChannelId,
  }: IChannelMoveResourcesArgs,
  { models, subdomain, user, checkPermission }: IContext,
): Promise<IChannelMoveResourcesResult> => {
  if (!isChannelResourceType(resourceType)) {
    throw new Error(`Unknown channel resource type "${resourceType}".`);
  }

  const definition = CHANNEL_RESOURCE_DEFINITIONS[resourceType];

  await checkPermission(definition.permission);

  const uniqueIds = [...new Set(resourceIds.filter(Boolean))];

  if (sourceChannelId === targetChannelId) {
    throw new Error(
      'The destination channel must be different from the current one.',
    );
  }

  const channels = await readChannels(models, subdomain, user, [
    sourceChannelId,
    targetChannelId,
  ]);

  const sourceChannel = channels.find(
    (channel) => channel._id === sourceChannelId,
  );
  const targetChannel = channels.find(
    (channel) => channel._id === targetChannelId,
  );

  if (!sourceChannel) {
    throw new Error('Current channel not found.');
  }

  if (!targetChannel) {
    throw new Error('Destination channel not found.');
  }

  const collection = resourceCollection(models, definition);
  const { nameField } = definition;

  const documents = await collection.find({ _id: { $in: uniqueIds } }).lean();

  const resources: IMovableResource[] = documents.map((document) => ({
    _id: document._id,
    channelId: document.channelId || '',
    name: document[nameField] || '',
  }));

  const movedNames = resources.map((resource) => resource.name).filter(Boolean);

  const conflicts = movedNames.length
    ? await collection
        .find({
          channelId: targetChannelId,
          [nameField]: { $in: movedNames },
        })
        .lean()
    : [];

  validateChannelMove({
    definition,
    sourceChannelId,
    targetChannelId,
    resourceIds: uniqueIds,
    resources,
    conflictingNames: conflicts.map((conflict) => conflict[nameField] || ''),
  });

  await collection.updateMany(
    { _id: { $in: uniqueIds } },
    { $set: { channelId: targetChannelId } },
  );

  try {
    await cascadeMove(models, resourceType, resources, targetChannelId);
  } catch (e) {
    await collection.updateMany(
      { _id: { $in: uniqueIds } },
      { $set: { channelId: sourceChannelId } },
    );
    throw e;
  }

  return {
    movedIds: uniqueIds,
    movedCount: uniqueIds.length,
    sourceChannelId,
    targetChannelId,
    targetChannelName: targetChannel.name || '',
  };
};
