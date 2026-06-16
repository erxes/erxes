import {
  Button,
  cn,
  IAttachment,
  readImage,
  RelativeDateDisplay,
} from 'erxes-ui';
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

  return (
    <WhatsappMessageWrapper>
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

  if (!images.length) {
    return null;
  }

  return (
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
  );
};

const WhatsappAttachment = ({ attachment }: { attachment: IAttachment }) => {
  return (
    <img
      src={readImage(attachment.url)}
      alt={attachment.name}
      className="w-full aspect-square object-cover rounded bg-accent"
    />
  );
};
