import { useMessagePresentation } from '@/inbox/conversation-messages/hooks/useMessagePresentation';
import { MessageTextBubble } from '@/inbox/conversation-messages/components/messages/MessageTextBubble';
import { Button, cn } from 'erxes-ui';
import { MESSAGE_ACTION_BAR_CLASS } from '@/inbox/conversation-messages/constants/messageActions';
import { getProviderMessageId } from '@/inbox/conversation-messages/utils/message';
import { MessageDaySeparator } from '@/inbox/conversation-messages/components/messages/MessageStatus';
import { MessageWrapper } from '@/inbox/conversation-messages/components/MessageWrapper';
import { FormWidgetMessage } from '@/inbox/conversation-messages/components/FormWidgetMessage';
import { MessageAuthorHeader } from '@/inbox/conversation-messages/components/MessageAuthorHeader';
import { IconDots } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';
import type { MessagePresentationState } from '@/inbox/conversation-messages/types/MessagePresentation';
import { MessageActions } from '@/inbox/conversation-messages/components/MessageActions';
import { DiscordMessageActions } from '@/integrations/discord/components/DiscordMessageActions';
import {
  DeletedMessage,
  MessageForwardedIndicator,
  MessageMobileActions,
  MessagePinnedIndicator,
  MessageReactions,
  MessageReplyPreview,
} from '@/inbox/conversation-messages/components/MessageItemDetails';

import {
  MessageItemMedia,
  MessageItemContent,
} from '@/inbox/conversation-messages/components/MessageItemContent';

const MessageItemStatus = ({
  presentation,
  actionsOpen,
  onActionsOpenChange,
  additionalActions,
}: {
  presentation: MessagePresentationState;
  actionsOpen: boolean;
  onActionsOpenChange: (open: boolean) => void;
  additionalActions: ReactNode;
}) => {
  const {
    message,
    integration,
    isDeleted,
    showAuthorName,
    showBotName,
    effectiveReplyTo,
    isForwardedMessage,
  } = presentation;
  const { userId, createdAt, extraData, separatePrevious, separateNext } =
    message;
  return (
    <>
      {!isDeleted && extraData?.discordPinned && (
        <MessagePinnedIndicator userId={userId} />
      )}
      {!isDeleted && (
        <MessageMobileActions
          open={actionsOpen}
          onOpenChange={onActionsOpenChange}
          additionalActions={additionalActions}
        />
      )}
      {isDeleted && (
        <DeletedMessage
          createdAt={createdAt}
          integrationKind={integration?.kind}
          separatePrevious={separatePrevious}
          separateNext={separateNext}
          showAuthorName={showAuthorName}
          showBotName={showBotName}
        />
      )}
      {effectiveReplyTo && !isDeleted && (
        <MessageReplyPreview replyTo={effectiveReplyTo} />
      )}
      {isForwardedMessage && !isDeleted && <MessageForwardedIndicator />}
    </>
  );
};

export const MessageItem = () => {
  const [actionsOpen, setActionsOpen] = useState(false);
  const presentation = useMessagePresentation();
  const {
    message,
    previousMessage,
    forwardedSnapshot,
    normalizedDisplayContent,
    isDeleted,
    hasTextBubble,
    showAuthorName,
    showBotName,
    emptyMessageSpacing,
    hasRenderableContent,
  } = presentation;
  const {
    _id,
    userId,
    customerId,
    createdAt,
    attachments,
    formWidgetData,
    extraData,
    fromBot,
  } = message;

  const discordActionContent = hasTextBubble
    ? normalizedDisplayContent
    : undefined;
  const additionalActions = extraData?.discordMessageId ? (
    <DiscordMessageActions
      conversationId={message.conversationId || ''}
      messageId={extraData.discordMessageId}
      content={discordActionContent}
      isOwnMessage={Boolean(userId) || Boolean(fromBot)}
    />
  ) : undefined;

  if (formWidgetData)
    return (
      <FormWidgetMessage
        message={message}
        isDeleted={isDeleted}
        additionalActions={additionalActions}
      />
    );

  if (!hasRenderableContent) {
    return null;
  }

  return (
    <>
      <MessageDaySeparator
        createdAt={createdAt}
        previousCreatedAt={previousMessage?.createdAt}
      />
      <MessageAuthorHeader
        customerId={showAuthorName ? customerId : undefined}
        showBotName={showBotName}
      />
      <MessageWrapper
        actions={
          !isDeleted ? (
            <>
              <div className={MESSAGE_ACTION_BAR_CLASS}>
                <MessageActions additionalActions={additionalActions} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full bg-background shadow-sm md:hidden"
                aria-label="Message actions"
                onClick={() => setActionsOpen(true)}
              >
                <IconDots className="size-4" />
              </Button>
            </>
          ) : undefined
        }
        below={!isDeleted ? <MessageReactions /> : undefined}
      >
        <div
          id={`conversation-message-${_id}`}
          data-provider-message-id={getProviderMessageId(message)}
          onContextMenu={(event) => {
            if (window.matchMedia('(hover: none)').matches) {
              event.preventDefault();
              setActionsOpen(true);
            }
          }}
          className="relative w-fit min-w-0 max-w-full"
          key={_id}
        >
          <MessageItemStatus
            presentation={presentation}
            actionsOpen={actionsOpen}
            onActionsOpenChange={setActionsOpen}
            additionalActions={additionalActions}
          />
          {hasTextBubble ? (
            <MessageTextBubble presentation={presentation} />
          ) : (
            !isDeleted &&
            !forwardedSnapshot &&
            !attachments?.length && <div className={cn(emptyMessageSpacing)} />
          )}
          {!isDeleted && (
            <>
              <MessageItemMedia presentation={presentation} />
              <MessageItemContent presentation={presentation} />
            </>
          )}
        </div>
      </MessageWrapper>
    </>
  );
};
