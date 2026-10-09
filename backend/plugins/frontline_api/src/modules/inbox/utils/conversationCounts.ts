import { IListArgs } from '~/conversationQueryBuilder';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getIntegrationsKinds } from '@/inbox/utils';
import {
  type ICountBy,
  type IUserArgs,
} from '@/inbox/@types/conversationCounts';
import { CommonBuilder } from '@/inbox/utils/conversationCountBuilder';

// The builder holds mutable filters; serialize each count to avoid mixing scopes.
// Count conversations by channel
const countByChannels = async (
  models: IModels,
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const channels = await models.Channels.find({});

  await channels.reduce(async (previous, channel) => {
    await previous;
    await qb.buildAllQueries();
    await qb.channelFilter(channel._id);
    counts[channel._id] = CommonBuilder.runQueries();
  }, Promise.resolve());

  return counts;
};

// Count conversations by tag
const countByTags = async (
  subdomain: string,
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const tags: { _id: string }[] = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query',
    module: 'tags',
    action: 'find',
    defaultValue: [],
    input: {
      query: {
        type: 'inbox:conversation',
      },
    },
  });
  await tags.reduce(async (previous, tag) => {
    await previous;
    await qb.buildAllQueries();
    qb.tagFilter(tag._id);
    counts[tag._id] = CommonBuilder.runQueries();
  }, Promise.resolve());

  return counts;
};

// Count conversation by integration
const countByIntegrationTypes = async (
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const kindsMap = await getIntegrationsKinds();

  await Object.keys(kindsMap).reduce(async (previous, type) => {
    await previous;
    await qb.buildAllQueries();
    await qb.integrationTypeFilter(type);
    counts[type] = CommonBuilder.runQueries();
  }, Promise.resolve());

  return counts;
};

// Count conversations per individual Discord channel (each Discord channel is
// its own integration), keyed by integration id. Used by the inbox sidebar's
// "Discord Channels" section to badge each channel with its open count.
const countByIntegrations = async (
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const integrations = await qb.models.Integrations.findIntegrations({
    kind: 'discord-messenger',
  });

  await integrations.reduce(async (previous, integration) => {
    await previous;
    await qb.buildAllQueries();
    qb.integrationFilter(integration._id);
    counts[integration._id] = CommonBuilder.runQueries();
  }, Promise.resolve());

  return counts;
};

export const countByConversations = async (
  models: IModels,
  subdomain: string,
  params: IListArgs,
  integrationIds: string[],
  user: IUserArgs,
  only: string,
): Promise<ICountBy> => {
  const counts: ICountBy = {};

  const qb = new CommonBuilder(models, subdomain, params, integrationIds, user);

  switch (only) {
    case 'byChannels':
      await countByChannels(models, qb, counts);
      break;

    case 'byIntegrationTypes':
      await countByIntegrationTypes(qb, counts);
      break;

    case 'byTags':
      await countByTags(subdomain, qb, counts);
      break;

    case 'byIntegrations':
      await countByIntegrations(qb, counts);
      break;

    default:
      break;
  }

  return counts;
};
