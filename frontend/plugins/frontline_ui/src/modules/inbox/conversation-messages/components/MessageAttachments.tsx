import {
  Dialog,
  IAttachment,
  cn,
  formatBytes,
  readImage,
} from 'erxes-ui';
import { IconFile } from '@tabler/icons-react';

const AttachmentImage = (props: JSX.IntrinsicElements['img']) => (
  // skipcq: JS-W1015
  <img {...props} />
);

const MessageAttachment = ({
  attachment,
  length,
}: {
  attachment: IAttachment;
  length: number;
}) => {
  const single = length === 1;

  if (!attachment.type.startsWith('image')) {
    return (
      <a
        href={readImage(attachment.url)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          single ? 'col-span-2' : 'col-span-1',
          'flex w-full cursor-pointer items-center gap-3 rounded bg-accent px-3 py-2 no-underline hover:bg-accent/70',
        )}
      >
        <IconFile className="size-8 shrink-0 text-muted-foreground" />
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-primary">
            {attachment.name || 'File'}
          </span>
          {Boolean(attachment.size) && (
            <span className="text-xs text-muted-foreground">
              {formatBytes(attachment.size)}
            </span>
          )}
        </div>
      </a>
    );
  }

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className={cn(
            'overflow-hidden rounded bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
            single ? 'w-fit max-w-full' : 'aspect-square w-full',
          )}
        >
          <AttachmentImage
            src={readImage(attachment.url)}
            alt={attachment.name}
            loading="lazy"
            className={cn(
              single
                ? 'block max-h-96 max-w-full object-contain'
                : 'size-full object-cover',
            )}
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="max-w-fit border-0 bg-transparent p-0 shadow-none">
        <AttachmentImage
          src={readImage(attachment.url)}
          alt={attachment.name}
          className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
};

export const MessageAttachments = ({
  attachments,
}: {
  attachments?: IAttachment[];
}) => {
  if (!attachments?.length) return null;

  const single = attachments.length === 1;

  return (
    <div className={cn(single ? 'flex' : 'grid grid-cols-3 gap-2')}>
      {attachments.map((attachment, index) => (
        <MessageAttachment
          key={`${attachment.url}-${index}`}
          attachment={attachment}
          length={attachments.length}
        />
      ))}
    </div>
  );
};
