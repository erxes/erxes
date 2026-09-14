import { IconBrain, IconSparkles } from '@tabler/icons-react';
import { Avatar, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { CustomersInline, MembersInline } from 'ui-modules';

import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';

export const MessageWrapper = ({ children }: { children: React.ReactNode }) => {
  const {
    separateNext,
    customerId,
    userId,
    fromBot,
    formWidgetData,
    isGroupConversation,
    isBotMessage,
  } = useConversationMessageContext();
  const isOutgoing =
    Boolean(userId) || Boolean(isBotMessage && !isGroupConversation);
  const { customer } = useAtomValue(activeConversationState) || {};
  const inlineCustomers =
    !isGroupConversation && customer && customer._id === customerId
      ? [customer]
      : undefined;

  return (
    <div
      className={cn(
        'flex w-full items-end gap-2 py-0.5',
        isOutgoing ? 'justify-end' : 'justify-start',
        !separateNext && isOutgoing && 'pr-10',
        !separateNext && !isOutgoing && 'pl-10',
        formWidgetData && 'pb-4',
      )}
    >
      {customerId && separateNext && !isOutgoing && (
        <CustomersInline.Provider
          customerIds={[customerId]}
          customers={inlineCustomers}
        >
          <CustomersInline.Avatar size="xl" />
        </CustomersInline.Provider>
      )}
      {fromBot && !customerId && separateNext && !isOutgoing && (
        <Avatar size="xl">
          <Avatar.Fallback className="bg-primary/10 text-primary">
            <IconSparkles className="size-4" />
          </Avatar.Fallback>
        </Avatar>
      )}
      <div className="relative w-fit min-w-0 max-w-full">{children}</div>
      {userId && separateNext && (
        <MembersInline.Provider memberIds={[userId]}>
          <MembersInline.Avatar size="xl" />
        </MembersInline.Provider>
      )}
      {isBotMessage && !fromBot && separateNext && (
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <IconBrain className="size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};
