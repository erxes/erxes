import { markResolvers, sendTRPCMessage } from 'erxes-api-shared/utils';
import { createConversationAndMessage } from '@/inbox/trpc/inbox';
import { IPollCpUser, IPollSnapshot } from '@/poll/@types/poll';
import {
  buildPollSnapshot,
  getActivePoll,
  getCpVoterId,
  isPollClosed,
  refreshPollTallies,
} from '@/poll/utils';
import { IContext, IModels } from '~/connectionResolvers';

const VOTER_REQUIRED_ERROR =
  'Sign in to the client portal or send a visitorId to vote';

const resolveChannelIntegration = async (
  models: IModels,
  channelId?: string,
  brandId?: string,
) => {
  if (!channelId) {
    throw new Error('This poll is not attached to a channel');
  }

  const integration = await models.Integrations.findOne({
    channelId,
    kind: 'messenger',
    isActive: { $ne: false },
    ...(brandId ? { brandId } : {}),
  }).lean();

  if (!integration) {
    throw new Error(
      brandId
        ? "The poll's brand has no active messenger integration in this channel"
        : 'The poll channel has no erxes messenger integration to file the answer under',
    );
  }

  return integration;
};

const findCustomer = async (subdomain: string, customerId: string) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'findOne',
    input: { query: { _id: customerId } },
    defaultValue: null,
  });

const resolveCpUserCustomer = async (
  subdomain: string,
  integrationId: string,
  cpUser: IPollCpUser,
) => {
  if (cpUser.erxesCustomerId) {
    const existing = await findCustomer(subdomain, cpUser.erxesCustomerId);

    if (existing) {
      return existing;
    }
  }

  const matched = await sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'query',
    module: 'customers',
    action: 'getWidgetCustomer',
    input: {
      integrationId,
      email: cpUser.email,
      phone: cpUser.phone,
    },
    defaultValue: null,
  });

  if (matched) {
    return matched;
  }

  return sendTRPCMessage({
    subdomain,
    pluginName: 'core',
    method: 'mutation',
    module: 'customers',
    action: 'createMessengerCustomer',
    input: {
      doc: {
        integrationId,
        email: cpUser.email,
        phone: cpUser.phone,
        firstName: cpUser.firstName,
        lastName: cpUser.lastName,
      },
    },
    defaultValue: null,
  });
};

const resolveVisitorCustomer = async ({
  models,
  subdomain,
  integrationId,
  visitorId,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  visitorId: string;
}) => {
  const previousVote = await models.PollVotes.findOne({
    visitorId,
    customerId: { $exists: true, $nin: [null, ''] },
  }).lean();

  if (previousVote?.customerId) {
    const existing = await findCustomer(subdomain, previousVote.customerId);

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
      },
    },
    defaultValue: null,
  });
};

const assertSelection = (
  selected: string[],
  allowMultiselect: boolean,
  known: Set<string>,
) => {
  if (selected.length === 0) {
    throw new Error('Select at least one option');
  }

  if (!allowMultiselect && selected.length > 1) {
    throw new Error('This poll allows only one answer');
  }

  if (selected.some((optionId) => !known.has(optionId))) {
    throw new Error('Unknown poll option');
  }
};

export const cpPollMutations = {
  async cpPollSubmit(
    _root: undefined,
    {
      pollCode,
      optionIds,
      visitorId,
    }: { pollCode: string; optionIds: string[]; visitorId?: string },
    { models, subdomain, cpUser }: IContext,
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

    assertSelection(
      selected,
      Boolean(poll.allowMultiselect),
      new Set(poll.options.map((option) => option._id)),
    );

    const voterId = getCpVoterId(cpUser, visitorId);

    if (!voterId) {
      throw new Error(VOTER_REQUIRED_ERROR);
    }

    const integration = await resolveChannelIntegration(
      models,
      poll.channelId,
      poll.brandId,
    );

    const existingVote = await models.PollVotes.findOne({
      pollId: poll._id,
      voterId,
    }).lean();

    if (existingVote) {
      return {
        status: 'alreadyVoted',
        customerId: existingVote.customerId,
        conversationId: existingVote.conversationId,
      };
    }

    const guestVisitorId = cpUser ? undefined : visitorId;

    const customer = cpUser
      ? await resolveCpUserCustomer(
          subdomain,
          integration._id,
          cpUser as IPollCpUser,
        )
      : await resolveVisitorCustomer({
          models,
          subdomain,
          integrationId: integration._id,
          visitorId: voterId,
        });

    if (!customer) {
      throw new Error('Failed to identify the poll respondent');
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
      voterId,
      customerId: customer._id,
      visitorId: guestVisitorId,
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

  async cpPollVote(
    _root: undefined,
    {
      messageId,
      optionIds,
      visitorId,
    }: { messageId: string; optionIds: string[]; visitorId?: string },
    { models, subdomain, cpUser }: IContext,
  ) {
    const message = await models.ConversationMessages.getMessage(messageId);

    const snapshot = (message.extraData as { poll?: IPollSnapshot } | undefined)
      ?.poll;

    if (!snapshot?.pollId) {
      throw new Error('This message does not carry a poll');
    }

    if (isPollClosed(snapshot)) {
      throw new Error('This poll is closed');
    }

    const selected = [...new Set(optionIds)];

    assertSelection(
      selected,
      snapshot.allowMultiselect,
      new Set(snapshot.answers.map((answer) => answer.id)),
    );

    const voterId = getCpVoterId(cpUser, visitorId);

    if (!voterId) {
      throw new Error(VOTER_REQUIRED_ERROR);
    }

    await models.PollVotes.castVote({
      pollId: snapshot.pollId,
      messageId,
      conversationId: message.conversationId || '',
      voterId,
      customerId: cpUser?.erxesCustomerId,
      visitorId: cpUser ? undefined : visitorId,
      optionIds: selected,
    });

    return refreshPollTallies(models, subdomain, messageId);
  },
};

markResolvers(cpPollMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
