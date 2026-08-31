import { IPollDocument, IPollSnapshot } from '@/poll/@types/poll';
import { pConversationClientMessageInserted } from '@/inbox/graphql/resolvers/mutations/widget';
import { IModels } from '~/connectionResolvers';

export const buildPollSnapshot = (poll: IPollDocument): IPollSnapshot => ({
  pollId: poll._id,
  question: poll.question,
  answers: [...poll.options]
    .sort((a, b) => a.order - b.order)
    .map((option) => ({ id: option._id, text: option.text })),
  allowMultiselect: Boolean(poll.allowMultiselect),
  expiry: poll.durationHours
    ? new Date(Date.now() + poll.durationHours * 3_600_000).toISOString()
    : undefined,
  results: { isFinalized: false, answerCounts: [] },
});

export const isPollClosed = (snapshot: IPollSnapshot) => {
  if (snapshot.results?.isFinalized) {
    return true;
  }

  if (!snapshot.expiry) {
    return false;
  }

  const expiresAt = new Date(snapshot.expiry).getTime();

  return !Number.isNaN(expiresAt) && expiresAt <= Date.now();
};

export const refreshPollTallies = async (
  models: IModels,
  subdomain: string,
  messageId: string,
) => {
  const message = await models.ConversationMessages.findOne({ _id: messageId });

  if (!message) {
    throw new Error('Poll message not found');
  }

  const snapshot = (message.extraData as { poll?: IPollSnapshot } | undefined)
    ?.poll;

  if (!snapshot) {
    throw new Error('This message does not carry a poll');
  }

  const answerCounts = await models.PollVotes.countByOption({ messageId });
  const countById = new Map(answerCounts.map((row) => [row.id, row.count]));

  const results = {
    isFinalized: isPollClosed(snapshot),
    answerCounts: snapshot.answers.map((answer) => ({
      id: answer.id,
      count: countById.get(answer.id) || 0,
    })),
  };

  const updated = await models.ConversationMessages.findOneAndUpdate(
    { _id: messageId },
    { $set: { 'extraData.poll.results': results } },
    { new: true },
  );

  if (!updated) {
    throw new Error('Poll message not found');
  }

  if (updated.conversationId) {
    await models.Conversations.updateConversation(updated.conversationId, {
      isCustomerRespondedLast: true,
      readUserIds: [],
    });
  }

  await pConversationClientMessageInserted(
    subdomain,
    JSON.parse(JSON.stringify(updated)),
  );

  return updated;
};
