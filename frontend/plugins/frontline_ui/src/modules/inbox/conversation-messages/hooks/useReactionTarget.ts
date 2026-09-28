import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import {
  INSTAGRAM_REACTION_MESSAGE_KINDS,
  REACTIONS,
  REACTION_KINDS,
} from '@/inbox/conversation-messages/constants/messageActions';
import { getProviderMessageId } from '@/inbox/conversation-messages/utils/message';
import { IntegrationType } from '@/types/Integration';

export const useReactionTarget = () => {
  const message = useConversationMessageContext();
  const { _id: conversationId, integration } = useConversationContext();
  const currentUser = useAtomValue(currentUserState);
  const kind = integration?.kind || '';
  const isInstagram = kind === IntegrationType.INSTAGRAM_MESSENGER;
  const messageId = getProviderMessageId(message) || '';
  const supportedMessage =
    !isInstagram ||
    (!message.userId &&
      !message.fromBot &&
      INSTAGRAM_REACTION_MESSAGE_KINDS.has(message.messageKind || 'text'));
  const selectedReaction = (
    message.reactions?.length ? message.reactions : message.extraData?.reactions
  )?.find((reaction) => reaction.senderId === currentUser?._id)?.reaction;

  return {
    visible: REACTION_KINDS.has(kind) && supportedMessage,
    isInstagram,
    conversationId,
    messageId,
    disabled: !messageId,
    disabledReason: 'This message has no provider ID to react to',
    selectedReaction,
    reactions: isInstagram ? REACTIONS.slice(0, 1) : REACTIONS,
  };
};
