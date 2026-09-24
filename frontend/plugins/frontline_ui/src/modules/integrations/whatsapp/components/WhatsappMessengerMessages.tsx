import {
  Button,
  cn,
  formatBytes,
  IAttachment,
  readImage,
  RelativeDateDisplay,
} from 'erxes-ui';
import { IconFile } from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { CustomersInline, MembersInline } from 'ui-modules';
import { MessageContent } from '@/inbox/conversation-messages/components/MessageContent';
import { HAS_ATTACHMENT } from '@/inbox/constants/messengerConstants';
import { activeConversationState } from '@/inbox/conversations/states/activeConversationState';
import { useWhatsappMessengerMessageContext } from '../context/WhatsappMessengerMessageContext';

export const WhatsappMessengerMessage = () => {
  const {
    content,
    internal,
    separateNext,
    createdAt,
    _id,
    userId,
    separatePrevious,
    attachments,
  } = useWhatsappMessengerMessageContext();

  const hasAttachments = !!attachments?.length;

  return (
    <WhatsappMessageWrapper>
      <div className={cn('max-w-[428px]')} key={_id}>
        {content !== HAS_ATTACHMENT && (
          <Button
            variant="secondary"
            className={cn(
              'mt-2 h-auto py-2 text-left **:whitespace-pre-wrap block font-normal space-y-2 overflow-x-hidden text-pretty wrap-break-word [&_a]:text-primary [&_a]:underline [&_img]:aspect-square [&_img]:object-cover [&_img]:rounded',
              userId && 'bg-primary/10 hover:bg-primary/10',
              internal && 'bg-warning/20 hover:bg-warning/5',
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
        )}
        {content === HAS_ATTACHMENT && hasAttachments && (
          <div className={cn(separatePrevious ? 'mt-8' : 'mt-2')} />
        )}
        <WhatsappAttachments attachments={attachments} />
      </div>
    </WhatsappMessageWrapper>
  );
};

export const WhatsappMessageWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { separateNext, customerId, userId } =
    useWhatsappMessengerMessageContext();
  const { customer } = useAtomValue(activeConversationState) || {};

  return (
    <div
      className={cn(
        'flex items-end w-full gap-3',
        userId ? 'justify-end' : 'justify-start',
        !separateNext && 'px-11',
        !customerId && 'pl-11',
        !userId && 'pr-11',
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

const WhatsappAttachments = ({
  attachments,
}: {
  attachments?: IAttachment[];
}) => {
  if (!attachments?.length) {
    return null;
  }

  const images = attachments.filter((attachment) =>
    attachment.type?.startsWith('image'),
  );
  const files = attachments.filter(
    (attachment) => !attachment.type?.startsWith('image'),
  );

  if (!images.length && !files.length) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {images.length > 0 && (
        <div
          className={cn(
            'grid grid-cols-3 gap-2',
            images.length === 1 && 'grid-cols-2',
          )}
        >
          {images.map((attachment) => (
            <WhatsappAttachment key={attachment.url} attachment={attachment} />
          ))}
        </div>
      )}
      {files.length > 0 && (
        <div className="flex flex-col gap-1">
          {files.map((attachment) => (
            <a
              key={attachment.url}
              href={readImage(attachment.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-primary hover:underline min-w-0"
            >
              <IconFile size={16} className="flex-none text-muted-foreground" />
              <span className="truncate">
                {attachment.name || attachment.url}
              </span>
              {attachment.size ? (
                <span className="flex-none text-muted-foreground">
                  {formatBytes(attachment.size)}
                </span>
              ) : null}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const WhatsappAttachment = ({ attachment }: { attachment: IAttachment }) => {
  return (
    <img
      src={readImage(attachment.url)}
      alt={attachment.name || ''}
      className="w-full aspect-square object-cover rounded bg-accent"
    />
  );
};
