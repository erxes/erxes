import type { IMessage } from '@/inbox/types/Conversation';
import { REACTION_EMOJI } from '@/inbox/conversation-messages/constants/messageActions';

const REACTION_NAME_BY_EMOJI = Object.fromEntries(
  Object.entries(REACTION_EMOJI).map(([reaction, emoji]) => [emoji, reaction]),
);

export const getReactionKey = (reaction: {
  emoji?: string;
  reaction?: string;
}) => {
  if (reaction.reaction && REACTION_EMOJI[reaction.reaction]) {
    return reaction.reaction;
  }

  return (
    REACTION_NAME_BY_EMOJI[reaction.emoji || ''] ||
    REACTION_NAME_BY_EMOJI[reaction.reaction || ''] ||
    reaction.reaction ||
    reaction.emoji ||
    'love'
  );
};

export const aggregateReactions = (
  reactions?: Array<{ senderId: string; emoji?: string; reaction?: string }>,
) => {
  const counts = new Map<string, { count: number; reaction: string }>();
  for (const reaction of reactions || []) {
    const label =
      reaction.emoji ||
      REACTION_EMOJI[reaction.reaction || ''] ||
      reaction.reaction ||
      '♥';
    const current = counts.get(label);
    counts.set(label, {
      count: (current?.count || 0) + 1,
      reaction: current?.reaction || getReactionKey(reaction),
    });
  }
  return [...counts.entries()].map(([label, value]) => ({ label, ...value }));
};

export const getProviderMessageId = (message: IMessage) =>
  message.providerData?.messageId ||
  message.extraData?.discordMessageId ||
  message.mid;
