import { IconBrain, IconSparkles } from '@tabler/icons-react';
import { Avatar, cn } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { CustomersInline, MembersInline } from 'ui-modules';

import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';

type InlineCustomers = React.ComponentProps<
  typeof CustomersInline.Provider
>['customers'];

const isOutgoingMessage = (
  userId?: string,
  isBotMessage?: boolean,
  isGroupConversation?: boolean,
) => Boolean(userId) || Boolean(isBotMessage && !isGroupConversation);

const getRowClassName = (
  isOutgoing: boolean,
  separateNext: boolean,
  formWidgetData: unknown,
) =>
  cn(
    'group flex w-full items-end gap-2 py-0.5',
    isOutgoing ? 'justify-end' : 'justify-start',
    !separateNext && isOutgoing && 'pr-10',
    !separateNext && !isOutgoing && 'pl-10',
    Boolean(formWidgetData) && 'pb-4',
  );

const MessageActionBar = ({
  actions,
  isOutgoing,
}: {
  actions?: React.ReactNode;
  isOutgoing: boolean;
}) => {
  if (!actions) {
    return null;
  }

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

const MessageAuthorAvatar = ({
  customerId,
  fromBot,
  inlineCustomers,
}: {
  customerId?: string;
  fromBot?: boolean;
  inlineCustomers?: InlineCustomers;
}) => {
  if (customerId) {
    return (
      <CustomersInline.Provider
        customerIds={[customerId]}
        customers={inlineCustomers}
      >
        <CustomersInline.Avatar size="xl" />
      </CustomersInline.Provider>
    );
  }

  if (fromBot) {
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

const MessageMemberAvatar = ({
  userId,
  isBotMessage,
  fromBot,
}: {
  userId?: string;
  isBotMessage?: boolean;
  fromBot?: boolean;
}) => {
  if (userId) {
    return (
      <MembersInline.Provider memberIds={[userId]}>
        <MembersInline.Avatar size="xl" />
      </MembersInline.Provider>
    );
  }

  if (isBotMessage && !fromBot) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
        <IconBrain className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return null;
};

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
  const isOutgoing = isOutgoingMessage(
    userId,
    isBotMessage,
    isGroupConversation,
  );
  const { customer } = useAtomValue(activeConversationState) || {};
  const inlineCustomers =
    !isGroupConversation && customer && customer._id === customerId
      ? [customer]
      : undefined;

  return (
    <div className={getRowClassName(isOutgoing, separateNext, formWidgetData)}>
      {separateNext && !isOutgoing && (
        <MessageAuthorAvatar
          customerId={customerId}
          fromBot={fromBot}
          inlineCustomers={inlineCustomers}
        />
      )}
      {isOutgoing && <MessageActionBar actions={actions} isOutgoing />}
      <div className="relative w-fit min-w-0 max-w-full">{children}</div>
      {!isOutgoing && <MessageActionBar actions={actions} isOutgoing={false} />}
      {separateNext && (
        <MessageMemberAvatar
          userId={userId}
          isBotMessage={isBotMessage}
          fromBot={fromBot}
        />
      )}
    </div>
  );
};
