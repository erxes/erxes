import { IListArgs } from '~/conversationQueryBuilder';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getIntegrationsKinds } from '@/inbox/utils';
import {
  type ICountBy,
  type IUserArgs,
} from '@/inbox/@types/conversationCounts';
import { CommonBuilder } from '@/inbox/utils/conversationCountBuilder';

// Count conversatio  by channel
const countByChannels = async (
  models: IModels,
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const channels = await models.Channels.find({});

  for (const channel of channels) {
    await qb.buildAllQueries();
    await qb.channelFilter(channel._id);

    counts[channel._id as string] = await qb.runQueries();
  }

  return counts;
};

// Count converstaion by tag
const countByTags = async (
  subdomain: string,
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const tags = await sendTRPCMessage({
    subdomain,

    pluginName: 'core',
    method: 'query', // this is a mutation, not a query
    module: 'tags',
    action: 'find',
    input: {
      query: {
        type: 'inbox:conversation',
      },
    },
  });
  for (const tag of tags) {
    await qb.buildAllQueries();
    await qb.tagFilter(tag._id);

    counts[tag._id] = await qb.runQueries();
  }

  return counts;
};

// Count conversation by integration
const countByIntegrationTypes = async (
  qb: CommonBuilder<IListArgs>,
  counts: ICountBy,
): Promise<ICountBy> => {
  const kindsMap = await getIntegrationsKinds();

  for (const type of Object.keys(kindsMap)) {
    await qb.buildAllQueries();
    await qb.integrationTypeFilter(type);

    counts[type] = await qb.runQueries();
  }

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

  for (const integration of integrations) {
    await qb.buildAllQueries();
    qb.integrationFilter(integration._id);

    counts[integration._id as string] = await qb.runQueries();
  }

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
  }

  return counts;
};
