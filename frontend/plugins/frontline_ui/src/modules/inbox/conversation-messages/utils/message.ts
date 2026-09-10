import type { IMessage } from '@/inbox/types/Conversation';
import { REACTION_EMOJI } from '@/inbox/conversation-messages/constants/messageActions';

export const aggregateReactions = (
  reactions?: Array<{ senderId: string; emoji?: string; reaction?: string }>,
) => {
  const counts = new Map<string, number>();
  for (const reaction of reactions || []) {
    const label =
      reaction.emoji ||
      REACTION_EMOJI[reaction.reaction || ''] ||
      reaction.reaction ||
      '♥';
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].map(([label, count]) => ({ label, count }));
};

export const getProviderMessageId = (message: IMessage) =>
  message.providerData?.messageId ||
  message.extraData?.discordMessageId ||
  message.mid;
