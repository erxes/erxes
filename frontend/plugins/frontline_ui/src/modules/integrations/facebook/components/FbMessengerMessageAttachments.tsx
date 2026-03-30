import { useFbMessengerMessageContext } from '@/integrations/facebook/contexts/FbMessengerMessageContext';
import { IconFile } from '@tabler/icons-react';
import { Dialog, IAttachment, cn, readImage } from 'erxes-ui';

export const FbMessengerMessageAttachments = ({
  attachments,
}: {
  attachments?: IAttachment[];
}) => {
  if (!attachments?.length) {
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
  const { userId, customerId, botData } = useFbMessengerMessageContext();
  const isOutgoing = !!userId || !!botData?.length;
  const isImage = attachment.type.startsWith('image/');

  if (!isImage) {
    return (
      <div
        className={cn(
          {
            'col-span-2': length === 1,
            'col-span-1': length !== 1,
          },
          'flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-accent px-2 py-1',
        )}
        onClick={() => {
          window.open(
            readImage(attachment.url),
            '_blank',
            'noopener,noreferrer',
          );
        }}
      >
        <IconFile className="h-4 w-4 text-muted-foreground" />
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
              'col-start-2': length === 1 && isOutgoing,
              'col-start-1':
                length !== 1 || (length === 1 && (!isOutgoing || customerId)),
            },
            'aspect-square w-full overflow-hidden rounded bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
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
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
};
