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
  const isSticker = attachment.type === 'sticker';
  const isImage = attachment.type.startsWith('image') || isSticker;

  if (!isImage) {
    return (
      <a
        href={readImage(attachment.url)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          {
            'col-span-2': length === 1,
            'col-span-1': length !== 1,
          },
          'flex w-full cursor-pointer items-center justify-center gap-2 rounded bg-accent px-2 py-1',
        )}
      >
        <IconFile className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{attachment.name}</span>
      </a>
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
            'overflow-hidden rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            isSticker
              ? 'w-fit max-w-full bg-transparent'
              : 'aspect-square w-full bg-accent',
          )}
        >
          <img
            src={readImage(attachment.url)}
            alt={attachment.name}
            loading="lazy"
            width={200}
            height={200}
            className={
              isSticker
                ? 'block max-h-48 max-w-48 bg-transparent object-contain'
                : 'size-full object-cover'
            }
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
