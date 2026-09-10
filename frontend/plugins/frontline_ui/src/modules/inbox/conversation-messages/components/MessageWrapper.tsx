import { useAtomValue } from 'jotai';
import { Avatar, cn } from 'erxes-ui';
import { IconBrain, IconSparkles } from '@tabler/icons-react';
import { CustomersInline, MembersInline } from 'ui-modules';

import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';

const IncomingAvatar = ({
  customerId,
  fromBot,
  separateNext,
  isGroupConversation,
}: {
  customerId?: string;
  fromBot?: boolean;
  separateNext: boolean;
  isGroupConversation?: boolean;
}) => {
  const { customer } = useAtomValue(activeConversationState) || {};
  const inlineCustomers =
    !isGroupConversation && customer && customer._id === customerId
      ? [customer]
      : undefined;

  if (customerId && separateNext) {
    return (
      <CustomersInline.Provider
        customerIds={[customerId]}
        customers={inlineCustomers}
      >
        <CustomersInline.Avatar size="xl" />
      </CustomersInline.Provider>
    );
  }

  if (fromBot && separateNext) {
    return (
      <Avatar size="xl">
        <Avatar.Fallback className="bg-primary/10 text-primary">
          <IconSparkles className="size-4" />
        </Avatar.Fallback>
      </Avatar>
    );
  }

  return null;
};

const OutgoingAvatar = ({
  userId,
  fromBot,
  separateNext,
  isBotMessage,
}: {
  userId?: string;
  fromBot?: boolean;
  separateNext: boolean;
  isBotMessage?: boolean;
}) => {
  if (userId && separateNext) {
    return (
      <MembersInline.Provider memberIds={[userId]}>
        <MembersInline.Avatar size="xl" />
      </MembersInline.Provider>
    );
  }

  if (isBotMessage && !fromBot && separateNext) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <IconBrain className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return null;
};

const MessageActionBar = ({
  actions,
  isOutgoing,
}: {
  actions?: React.ReactNode;
  isOutgoing: boolean;
}) => {
  if (!actions) return null;

  return (
    <div
      className={cn(
        'z-30 shrink-0 self-end pb-1',
        isOutgoing ? '-mr-1' : '-ml-1',
      )}
    >
      {actions}
    </div>
  );
};

const messageWrapperClassName = ({
  isOutgoing,
  separateNext,
  hasFormWidget,
}: {
  isOutgoing: boolean;
  separateNext: boolean;
  hasFormWidget: boolean;
}) =>
  cn(
    'group flex w-full items-end gap-2 py-0.5',
    isOutgoing ? 'justify-end' : 'justify-start',
    !separateNext && isOutgoing && 'pr-10',
    !separateNext && !isOutgoing && 'pl-10',
    hasFormWidget && 'pb-4',
  );

export const MessageWrapper = ({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) => {
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

  return (
    <div
      className={messageWrapperClassName({
        isOutgoing,
        separateNext,
        hasFormWidget: Boolean(formWidgetData),
      })}
    >
      {!isOutgoing && (
        <IncomingAvatar
          customerId={customerId}
          fromBot={fromBot}
          separateNext={separateNext}
          isGroupConversation={isGroupConversation}
        />
      )}
      {isOutgoing && (
        <MessageActionBar actions={actions} isOutgoing={isOutgoing} />
      )}
      <div className="relative w-fit min-w-0 max-w-full">{children}</div>
      {!isOutgoing && (
        <MessageActionBar actions={actions} isOutgoing={isOutgoing} />
      )}
      <OutgoingAvatar
        userId={userId}
        fromBot={fromBot}
        separateNext={separateNext}
        isBotMessage={isBotMessage}
      />
    </div>
  );
};
