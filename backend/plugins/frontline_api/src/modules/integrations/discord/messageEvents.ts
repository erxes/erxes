import type { PipelineStage } from 'mongoose';
import { graphqlPubsub } from 'erxes-api-shared/utils';

/** Replace only an agent's target emoji without overwriting concurrent reactions. */
export const buildDiscordReactionUpdate = ({
  senderId,
  botId,
  emoji,
  reaction,
  remove,
}: {
  senderId: string;
  botId: string;
  emoji: string;
  reaction: string;
  remove: boolean;
}): PipelineStage[] => {
  const remaining = {
    $filter: {
      input: {
        $ifNull: ['$extraData.reactions', { $ifNull: ['$reactions', []] }],
      },
      as: 'item',
      cond: {
        $not: [
          {
            $and: [
              { $in: ['$$item.senderId', { $literal: [senderId, botId] }] },
              { $eq: ['$$item.emoji', { $literal: emoji }] },
            ],
          },
        ],
      },
    },
  };
  const reactions = remove
    ? remaining
    : {
        $concatArrays: [
          remaining,
          { $literal: [{ senderId, reaction, emoji }] },
        ],
      };
  return [{ $set: { 'extraData.reactions': reactions, reactions } }];
};

/** Publish the canonical Discord message after an inbox reaction action. */
export const publishDiscordMessage = async <T extends object>(
  conversationId: string,
  message: T,
): Promise<void> => {
  await graphqlPubsub.publish(`conversationMessageInserted:${conversationId}`, {
    conversationMessageInserted: { ...message, conversationId },
  });
};
