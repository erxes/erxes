import { Button, RelativeDateDisplay, cn, useQueryState } from 'erxes-ui';
import { useFbMessengerMessageContext } from '../contexts/FbMessengerMessageContext';
import { useAtomValue } from 'jotai';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { CustomersInline, MembersInline } from 'ui-modules';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { FbMessengerBotMessageItem } from './FbMessengerBotMessageBlocks/FbMessengerBotMessageItem';
import { FbMessengerMessageAttachments } from './FbMessengerMessageAttachments';
import { FacebookMessageRelationNotice } from './FacebookMessageRelationNotice';
import { useEffect, useRef } from 'react';

export const FbMessengerMessage = () => {
  const {
    content,
    internal,
    separateNext,
    createdAt,
    _id,
    userId,
    separatePrevious,
    attachments,
    botData,
  } = useFbMessengerMessageContext();
  const [focusedMessageId] = useQueryState<string>('messageId');
  const isFocused = focusedMessageId === _id;

  if (botData?.length) {
    return (
      <MessageWrapper isFocused={isFocused}>
        <div className="flex max-w-92 flex-col items-end">
          <FbMessengerBotMessageItem
            botData={botData}
            attachments={attachments}
            createdAt={createdAt}
            separatePrevious={separatePrevious}
            separateNext={separateNext}
            userId={userId}
            internal={internal}
            isFocused={isFocused}
          />
          <FacebookMessageRelationNotice placement="messenger" />
        </div>
      </MessageWrapper>
    );
  }

  return (
    <MessageWrapper isFocused={isFocused}>
      <div className={cn('max-w-[428px]')} key={_id}>
        {content !== HAS_ATTACHMENT ? (
          <Button
            variant="secondary"
            className={cn(
              'mt-2 h-auto py-2 text-left **:whitespace-pre-wrap block font-normal space-y-2 overflow-x-hidden text-pretty wrap-break-word [&_a]:text-primary [&_a]:underline [&_img]:aspect-square [&_img]:object-cover [&_img]:rounded',
              userId && 'bg-primary/10 hover:bg-primary/10',
              internal && 'bg-warning/20 hover:bg-warning/5',
              separatePrevious && 'mt-8',
            )}
            style={
              isFocused
                ? {
                    boxShadow:
                      '0 0 0 1px color-mix(in oklab, var(--color-primary) 10%, transparent), 0 0 18px color-mix(in oklab, var(--color-primary) 20%, transparent)',
                  }
                : undefined
            }
            asChild
          >
            <div>
              <MessageContent content={content} internal={internal} />
              {separateNext && (
                <div className="text-muted-foreground mt-1">
                  <RelativeDateDisplay value={createdAt}>
                    <RelativeDateDisplay.Value value={createdAt} />
                  </RelativeDateDisplay>
                </div>
              )}
            </div>
          </Button>
        ) : (
          <div className={cn(separatePrevious ? 'mt-2' : 'mt-8')} />
        )}
        <FacebookMessageRelationNotice placement="comment" />
        <FbMessengerMessageAttachments attachments={attachments} />
      </div>
    </MessageWrapper>
  );
};

export const MessageWrapper = ({
  children,
  isFocused,
}: {
  children: React.ReactNode;
  isFocused?: boolean;
}) => {
  const { separateNext, customerId, userId, botData } =
    useFbMessengerMessageContext();
  const isBotMessage = !!botData?.length;
  const isOutgoing = !!userId || isBotMessage;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { customer } = useAtomValue(activeConversationState) || {};

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    wrapperRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [isFocused]);

  return (
    <div
      ref={wrapperRef}
      className={cn(
        'flex items-end w-full gap-3',
        isOutgoing ? 'justify-end' : 'justify-start',
        !separateNext && !isBotMessage && 'px-11',
        !customerId && 'pl-11',
        !isOutgoing && 'pr-11',
      )}
    >
      {!!customerId && separateNext && !isOutgoing && (
        <CustomersInline.Provider
          customerIds={[customerId]}
          customers={customer ? [customer] : []}
        >
          <CustomersInline.Avatar size="xl" />
        </CustomersInline.Provider>
      )}
      {children}
      {!!userId && separateNext && (
        <MembersInline.Provider memberIds={[userId]}>
          <MembersInline.Avatar size="xl" />
        </MembersInline.Provider>
      )}
    </div>
  );
};
