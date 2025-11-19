import { useAtomValue } from 'jotai';
import {
  Button,
  Dialog,
  IAttachment,
  RelativeDateDisplay,
  cn,
  readImage,
} from 'erxes-ui';
import { CustomersInline, MembersInline } from 'ui-modules';

import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { ConversationFormDisplay } from '@/inbox/conversation-messages/components/ConversationFormDisplay';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { useConversationMessageContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationMessageContext';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { IconFile } from '@tabler/icons-react';

export const MessageItem = () => {
  const { previousMessage, nextMessage, ...message } =
    useConversationMessageContext();
  const {
    _id,
    userId,
    content,
    createdAt,
    attachments,
    formWidgetData,
    internal,
    separatePrevious,
    separateNext,
  } = message;

  if (formWidgetData)
    return (
      <MessageWrapper>
        <ConversationFormDisplay {...message} />
      </MessageWrapper>
    );

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
        <Attachments attachments={attachments} />
      </div>
    </MessageWrapper>
  );
};

export const MessageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { separateNext, customerId, userId, formWidgetData } =
    useConversationMessageContext();
  const { customer } = useAtomValue(activeConversationState) || {};
  return (
    <div
      className={cn(
        'flex items-end w-full gap-3',
        userId ? 'justify-end' : 'justify-start',
        !separateNext && !customerId && 'px-11',
        !customerId && !userId && 'px-0 pl-0 pr-0',
        !customerId && 'pl-11',
        !userId && 'pr-11',
        formWidgetData && 'pb-4',
      )}
    >
      {!!customerId && separateNext && (
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

const Attachments = ({ attachments }: { attachments?: IAttachment[] }) => {
  if (!attachments) {
    return null;
  }

  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2',
        attachments.length === 1 && 'grid-cols-2',
      )}
    >
      {attachments.map((attachment, index) => (
        <Attachment
          key={`${attachment.url}-${index}`}
          attachment={attachment}
          length={attachments.length}
        />
      ))}
    </div>
  );
};

const Attachment = ({
  attachment,
  length,
}: {
  attachment: IAttachment;
  length?: number;
}) => {
  const { userId, customerId } = useConversationMessageContext();
  const isImage = attachment.type.startsWith('image/');
  if (!isImage) {
    return (
      <div
        className={cn(
          {
            'col-span-2': length === 1,
            'col-span-1': length !== 1,
          },
          'w-full px-2 py-1 rounded bg-accent flex items-center justify-center gap-2 cursor-pointer',
        )}
        onClick={() => {
          window.open(
            readImage(attachment.url),
            '_blank',
            'noopener,noreferrer',
          );
        }}
      >
        <IconFile className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{attachment.name}</span>
      </div>
    );
  }
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            {
              'col-start-2': length === 1 && userId,
              'col-start-1': length !== 1 || (length === 1 && customerId),
            },
            'w-full aspect-square overflow-hidden rounded bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
          )}
        >
          <img
            src={readImage(attachment.url)}
            alt={attachment.name}
            loading="lazy"
            width={200}
            height={200}
            className="size-full object-cover"
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-fit border-0 bg-transparent p-0 shadow-none">
        <img
          src={readImage(attachment.url)}
          alt={attachment.name}
          className="max-w-[90vw] max-h-[90vh] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
};
