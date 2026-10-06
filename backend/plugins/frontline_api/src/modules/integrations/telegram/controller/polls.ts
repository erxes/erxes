import type { IModels } from '~/connectionResolvers';
import { telegramPollSchema } from '../utils/message';
import { normalizeTelegramPoll } from '../utils/content';
import { syncTelegramInboxMessage } from './sync';
import { withTelegramEventLease } from './eventLease';

export const receiveTelegramPoll = async ({
  models,
  subdomain,
  integrationId,
  payload,
  updateId,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  payload: unknown;
  updateId: number;
}): Promise<void> => {
  const poll = telegramPollSchema.parse(payload);
  const messages = await models.TelegramConversationMessages.find({
    integrationId,
    pollId: poll.id,
  });
  for (const message of messages) {
    await withTelegramEventLease(models, message._id, async () => {
      const current =
        await models.TelegramConversationMessages.findOneAndUpdate(
          {
            _id: message._id,
            $or: [
              { pollUpdateId: null },
              { pollUpdateId: { $lte: updateId } },
              // Telegram can reset update IDs after a week without updates; old
              // deliveries expire after 24 hours, so they cannot cross this window.
              { pollUpdateAt: { $lt: new Date(Date.now() - 7 * 86400_000) } },
            ],
          },
          {
            $set: {
              poll: normalizeTelegramPoll(poll),
              pollUpdateId: updateId,
              pollUpdateAt: new Date(),
            },
          },
          { new: true },
        );
      const latest =
        current ??
        (await models.TelegramConversationMessages.getMessage({
          _id: message._id,
        }));
      const conversation = await models.TelegramConversations.findOne({
        _id: latest.conversationId,
        integrationId,
      });
      if (!conversation?.erxesApiId)
        throw new Error(
          'Telegram conversation is not linked yet; retry the webhook',
        );
      await syncTelegramInboxMessage(
        models,
        subdomain,
        conversation.erxesApiId,
        latest,
        { 'extraData.poll': latest.poll },
        {
          field: 'pollVersion',
          value: `${String(latest.pollUpdateAt?.getTime() ?? 0).padStart(
            16,
            '0',
          )}:${String(latest.pollUpdateId ?? 0).padStart(20, '0')}`,
        },
      );
    });
  }
};
