import { Button, Tooltip } from 'erxes-ui';
import { useContext } from 'react';
import type { IConversationContextValue } from '@/inbox/types/Conversation';
import { ConversationIdleClockContext } from '../context/ConversationIdleClockContext';
import {
  conversationIdleSince,
  CONVERSATION_IDLE_TIMEOUT,
} from '../utils/conversationIdle';
import { useConversationIdleTranslation } from '../idleTranslations';

export const ConversationIdleIndicator = ({
  conversation,
}: {
  conversation: IConversationContextValue;
}) => {
  const { t } = useConversationIdleTranslation();
  const now = useContext(ConversationIdleClockContext) ?? Date.now();
  const lastActivity = conversationIdleSince(conversation);
  if (lastActivity === null || now - lastActivity < CONVERSATION_IDLE_TIMEOUT)
    return null;
  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('conversationIdle')}
          onClick={(event) => event.stopPropagation()}
          className="p-0 rounded-none hover:bg-transparent absolute bottom-0 right-0 z-10 flex size-4 origin-bottom-right items-end justify-end transition-transform hover:scale-125 focus-visible:scale-125 focus-visible:outline-none motion-reduce:transition-none"
        >
          <span className="size-0 border-b-[12px] border-l-[12px] border-b-orange-500 border-l-transparent drop-shadow-sm" />
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <span className="block font-medium">{t('conversationIdle')}</span>
        <span className="block">{t('idleDescription')}</span>
        <span className="block">
          {t(
            conversation.lastMessage
              ? 'lastPublicMessage'
              : 'conversationCreated',
          )}
          : {new Date(lastActivity).toLocaleString()}
        </span>
      </Tooltip.Content>
    </Tooltip>
  );
};
