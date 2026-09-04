import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { IPollDocument } from '@/poll/@types/poll';
import { POLL_STATUSES } from '@/poll/db/definitions/polls';
import {
  buildPollSnapshot,
  isPollClosed,
  refreshPollTallies,
} from '@/poll/utils';
import { createConversationAndMessage } from '@/inbox/trpc/inbox';
import { IContext, IModels } from '~/connectionResolvers';

const getActivePoll = async (
  models: IModels,
  pollCode: string,
): Promise<IPollDocument | null> =>
  models.Polls.findOne({
    $or: [{ code: pollCode }, { _id: pollCode }],
    status: POLL_STATUSES.ACTIVE,
  });

const resolveChannelIntegration = async (
  models: IModels,
  channelId?: string,
) => {
  if (!channelId) {
    throw new Error('This poll is not attached to a channel');
  }

  const integration = await models.Integrations.findOne({
    channelId,
    kind: 'messenger',
    isActive: { $ne: false },
  }).lean();

  if (!integration) {
    throw new Error(
      'The poll channel has no erxes messenger integration to file the answer under',
    );
  }

  return integration;
};

const resolveCustomer = async (
  subdomain: string,
  channelId: string,
  integrationId: string,
  cachedCustomerId?: string,
) => {
  if (cachedCustomerId) {
    const existing = await sendTRPCMessage({
      subdomain,
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: { query: { _id: cachedCustomerId } },
      defaultValue: null,
    });

    if (existing) {
      return existing;
    }
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'createCustomer',
    input: {
      doc: {
        state: 'visitor',
        integrationId,
        relatedIntegrationIds: [integrationId],
        scopeBrandIds: [channelId],
      },
    },
    defaultValue: null,
  });
};

export const widgetPollPopupMutations = {
  async widgetsPollConnect(
    _root: undefined,
    {
      channelId,
      pollCode,
      cachedCustomerId,
    }: { channelId: string; pollCode: string; cachedCustomerId?: string },
    { models }: IContext,
  ) {
    const channel = await models.Channels.findOne({ _id: channelId }).lean();
    const poll = await getActivePoll(models, pollCode);

    if (!channel || !poll || poll.channelId !== channelId) {
      throw new Error('Invalid configuration');
    }

    const snapshot = buildPollSnapshot(poll);

    if (isPollClosed(snapshot)) {
      return { poll: null, votedOptionIds: [] };
    }

    const vote = cachedCustomerId
      ? await models.PollVotes.findOne({
          pollId: poll._id,
          voterId: cachedCustomerId,
        }).lean()
      : null;

    return { poll, votedOptionIds: vote?.optionIds || [] };
  },

  async widgetsPollSubmit(
    _root: undefined,
    {
      pollCode,
      optionIds,
      cachedCustomerId,
    }: {
      pollCode: string;
      optionIds: string[];
      cachedCustomerId?: string;
    },
    { models, subdomain }: IContext,
  ) {
    const poll = await getActivePoll(models, pollCode);

    if (!poll) {
      throw new Error('Poll not found');
    }

    const snapshot = buildPollSnapshot(poll);

    if (isPollClosed(snapshot)) {
      throw new Error('This poll is closed');
    }

    const selected = [...new Set(optionIds)];

    if (selected.length === 0) {
      throw new Error('Select at least one option');
    }

    if (!poll.allowMultiselect && selected.length > 1) {
      throw new Error('This poll allows only one answer');
    }

    const known = new Set(poll.options.map((option) => option._id));

    if (selected.some((optionId) => !known.has(optionId))) {
      throw new Error('Unknown poll option');
    }

    const integration = await resolveChannelIntegration(models, poll.channelId);

    const customer = await resolveCustomer(
      subdomain,
      poll.channelId as string,
      integration._id,
      cachedCustomerId,
    );

    if (!customer) {
      throw new Error('Failed to identify the visitor');
    }

    const existingVote = await models.PollVotes.findOne({
      pollId: poll._id,
      voterId: customer._id,
    }).lean();

    if (existingVote) {
      return {
        status: 'alreadyVoted',
        customerId: customer._id,
        conversationId: existingVote.conversationId,
      };
    }

    const { conversation, message } = await createConversationAndMessage(
      models,
      {
        customerId: customer._id,
        integrationId: integration._id,
        content: poll.question,
        status: 'new',
        extraData: { poll: snapshot },
      },
    );

    await models.Conversations.updateConversation(conversation._id, {
      hasPoll: true,
    });

    await models.PollVotes.castVote({
      pollId: poll._id,
      messageId: message._id,
      conversationId: conversation._id,
      voterId: customer._id,
      customerId: customer._id,
      optionIds: selected,
    });

    await models.Polls.increaseSentCount(poll._id);

    await refreshPollTallies(models, subdomain, message._id);

    return {
      status: 'ok',
      customerId: customer._id,
      conversationId: conversation._id,
    };
  },
};

markResolvers(widgetPollPopupMutations, {
  wrapperConfig: {
    skipPermission: true,
  },
});
