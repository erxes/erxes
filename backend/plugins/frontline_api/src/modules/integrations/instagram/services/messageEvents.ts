import type { IMessageReaction } from '@/inbox/@types/conversationMessages';
import { graphqlPubsub } from 'erxes-api-shared/utils';

export const replaceSenderReaction = (
  reactions: IMessageReaction[] | undefined,
  senderId: string,
  next?: IMessageReaction,
): IMessageReaction[] => [
  ...(reactions || []).filter((item) => item.senderId !== senderId),
  ...(next ? [next] : []),
];

export const publishInstagramMessage = async <T extends object>(
  conversationErxesApiId: string,
  message: T,
) => {
  await graphqlPubsub.publish(
    `conversationMessageInserted:${conversationErxesApiId}`,
    {
      conversationMessageInserted: {
        ...message,
        conversationId: conversationErxesApiId,
      },
    },
  );
};
