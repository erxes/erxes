import { IconFile } from '@tabler/icons-react';
import { Dialog, cn, formatBytes, readImage } from 'erxes-ui';
import { useState } from 'react';

import { UnsupportedMessage } from '@/inbox/conversation-messages/components/MessagePresentation';
import type { IAttachment } from 'erxes-ui';

const Img = ({
  alt,
  ...props
}: Omit<JSX.IntrinsicElements['img'], 'alt'> & { alt: string }) => (
  // skipcq: JS-W1015
  <img alt={alt} {...props} />
);
export const Attachments = ({
  attachments,
}: {
  attachments?: IAttachment[];
}) => {
  const [failedAttachmentKeys, setFailedAttachmentKeys] = useState<Set<string>>(
    () => new Set(),
  );

  if (!attachments?.length) {
    return null;
  }

  const single = attachments.length === 1;
  const attachmentKey = (attachment: IAttachment, index: number) =>
    `${attachment.url || 'missing'}-${index}`;
  const unavailableCount = attachments.filter(
    (attachment, index) =>
      !attachment.url ||
      failedAttachmentKeys.has(attachmentKey(attachment, index)),
  ).length;

  return (
    <div
      className={cn(
        single ? 'flex' : 'grid grid-cols-6 gap-1.5 overflow-hidden rounded-lg',
      )}
    >
      {attachments.map((attachment, index) => (
        <div
          key={attachmentKey(attachment, index)}
          className={cn(
            (!attachment.url ||
              failedAttachmentKeys.has(attachmentKey(attachment, index))) &&
              'hidden',
            !single && 'min-w-0',
            attachments.length === 2 && 'col-span-3',
            attachments.length === 3 &&
              (index < 2 ? 'col-span-3' : 'col-span-6 max-h-52'),
            attachments.length === 4 && 'col-span-3',
            attachments.length === 5 &&
              (index < 2 ? 'col-span-3' : 'col-span-2'),
            attachments.length > 5 && 'col-span-2',
          )}
        >
          <Attachment
            attachment={attachment}
            length={attachments.length}
            onUnavailable={() =>
              setFailedAttachmentKeys((current) => {
                const next = new Set(current);
                next.add(attachmentKey(attachment, index));
                return next;
              })
            }
          />
        </div>
      ))}
      {unavailableCount > 0 && (
        <div className="col-span-6">
          <UnsupportedMessage
            text={`${unavailableCount} attachment${
              unavailableCount === 1 ? '' : 's'
            } unavailable`}
          />
        </div>
      )}
    </div>
  );
};

const Attachment = ({
  attachment,
  length,
  onUnavailable,
}: {
  attachment: IAttachment;
  length?: number;
  onUnavailable: () => void;
}) => {
  const type = attachment.type || '';
  const isImage = type.startsWith('image');
  const isVideo = type.startsWith('video');
  const isAudio = type.startsWith('audio');
  const single = length === 1;
  if (!attachment.url) {
    return null;
  }
  if (isVideo) {
    return (
      <Dialog>
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label={`Preview ${attachment.name || 'video'}`}
            className="block size-full cursor-zoom-in overflow-hidden rounded bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <video
              src={readImage(attachment.url)}
              muted
              playsInline
              preload="metadata"
              onError={onUnavailable}
              className="size-full max-h-96 object-contain"
            />
          </button>
        </Dialog.Trigger>
        <Dialog.Content className="!flex !h-auto !max-h-[92vh] !w-auto !max-w-[94vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
          <video
            src={readImage(attachment.url)}
            controls
            autoPlay
            playsInline
            preload="metadata"
            className="block max-h-[88vh] max-w-[90vw] rounded-lg object-contain"
          >
            <track kind="captions" />
          </video>
        </Dialog.Content>
      </Dialog>
    );
  }
  if (isAudio) {
    return (
      <audio
        src={readImage(attachment.url)}
        controls
        preload="metadata"
        onError={onUnavailable}
        className="w-full min-w-64"
      >
        <track kind="captions" />
      </audio>
    );
  }
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
          'flex h-full w-full cursor-pointer items-center gap-3 rounded bg-accent px-3 py-2 no-underline hover:bg-accent/70',
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
            single ? 'w-fit max-w-full' : 'aspect-square size-full',
          )}
        >
          <Img
            src={readImage(attachment.url)}
            alt={attachment.name}
            loading="lazy"
            onError={onUnavailable}
            className={cn(
              single
                ? 'block max-h-96 max-w-full object-contain'
                : 'size-full object-cover',
            )}
          />
        </button>
      </Dialog.Trigger>
      <Dialog.Content className="!flex !h-auto !max-h-[92vh] !w-auto !max-w-[94vw] items-center justify-center !overflow-hidden !border-0 !bg-black/90 !p-2 shadow-2xl [&>button]:bg-white/10 [&>button]:text-white [&>button]:hover:bg-white/20">
        <Img
          src={readImage(attachment.url)}
          alt={attachment.name}
          className="block h-auto max-h-[88vh] w-auto max-w-[90vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
};
