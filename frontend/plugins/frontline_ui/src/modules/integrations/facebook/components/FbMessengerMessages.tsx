import { Button, RelativeDateDisplay, cn } from 'erxes-ui';
import { useFbMessengerMessageContext } from '../contexts/FbMessengerMessageContext';
import { useAtomValue } from 'jotai';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { CustomersInline, MembersInline } from 'ui-modules';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { FbMessengerBotMessageItem } from './FbMessengerBotMessageBlocks/FbMessengerBotMessageItem';
import { FbMessengerMessageAttachments } from './FbMessengerMessageAttachments';

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

  if (botData?.length) {
    return (
      <MessageWrapper>
        <FbMessengerBotMessageItem
          botData={botData}
          attachments={attachments}
          createdAt={createdAt}
          separatePrevious={separatePrevious}
          separateNext={separateNext}
          userId={userId}
          internal={internal}
        />
      </MessageWrapper>
    );
  }

  return (
    <MessageWrapper>
      <div className={cn('max-w-[428px]')} key={_id}>
        {content !== HAS_ATTACHMENT ? (
          <Button
            variant="secondary"
            className={cn(
              'mt-2 h-auto py-2 text-left **:whitespace-pre-wrap block font-normal space-y-2 overflow-x-hidden text-pretty wrap-break-word [&_a]:text-primary [&_a]:underline [&_img]:aspect-square [&_img]:object-cover [&_img]:rounded',
              userId && 'bg-primary/10 hover:bg-primary/10',
              internal &&
                'bg-yellow-50 hover:bg-yellow-50 dark:bg-yellow-950 dark:hover:bg-yellow-950',
              separatePrevious && 'mt-8',
            )}
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
        <FbMessengerMessageAttachments attachments={attachments} />
      </div>
    </MessageWrapper>
  );
};

export const MessageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { separateNext, customerId, userId, botData } =
    useFbMessengerMessageContext();
  const isBotMessage = !!botData?.length;
  const isOutgoing = !!userId || isBotMessage;

  const { customer } = useAtomValue(activeConversationState) || {};

  return (
    <div
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
