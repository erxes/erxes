import { useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import {
  INSTAGRAM_REACTION_MESSAGE_KINDS,
  REACTIONS,
  REACTION_KINDS,
} from '@/inbox/conversation-messages/constants/messageActions';
import {
  getOwnReactionKeys,
  getProviderMessageId,
} from '@/inbox/conversation-messages/utils/message';
import { IntegrationType } from '@/types/Integration';
import { useTranslation } from 'react-i18next';

export const useReactionTarget = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.inbox' });
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
  const selectedReactions = getOwnReactionKeys(message, currentUser?._id);

  return {
    visible: REACTION_KINDS.has(kind) && supportedMessage,
    isInstagram,
    conversationId,
    messageId,
    disabled: !messageId,
    disabledReason: t('reaction-no-provider-id'),
    selectedReactions,
    reactions: isInstagram ? REACTIONS.slice(0, 1) : REACTIONS,
  };
};
