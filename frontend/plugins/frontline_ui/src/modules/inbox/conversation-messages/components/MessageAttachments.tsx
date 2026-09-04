import { IconDownload, IconFile } from '@tabler/icons-react';
import { Dialog, cn, formatBytes, readImage } from 'erxes-ui';
import { useState } from 'react';

import { UnsupportedMessage } from '@/inbox/conversation-messages/components/MessagePresentation';
import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import type { IAttachment } from 'erxes-ui';

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

function VideoAttachment({
  attachment,
  onUnavailable,
}: Readonly<{
  attachment: IAttachment;
  onUnavailable: () => void;
}>) {
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
          >
            <track kind="captions" />
          </video>
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

function FileAttachmentTrigger({
  attachment,
}: Readonly<{
  attachment: IAttachment;
}>) {
  return (
    <Dialog.Trigger asChild>
      <button
        type="button"
        className="group flex w-full min-w-44 max-w-xs cursor-pointer items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 text-left shadow-2xs transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary">
          <IconFile className="size-5" />
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-semibold text-foreground">
            {attachment.name || 'File'}
          </span>
          {Boolean(attachment.size) && (
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              {formatBytes(attachment.size)} · Click to open
            </span>
          )}
        </div>
      </button>
    </Dialog.Trigger>
  );
}

function FileAttachmentPreview({
  attachment,
}: Readonly<{
  attachment: IAttachment;
}>) {
  return (
    <Dialog.Content className="max-w-sm rounded-2xl p-5">
      <Dialog.Header>
        <Dialog.Title className="truncate text-base">
          {attachment.name || 'File'}
        </Dialog.Title>
      </Dialog.Header>
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted text-primary">
          <IconFile className="size-7" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">
            {attachment.name || 'Attachment'}
          </p>
          {Boolean(attachment.size) && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatBytes(attachment.size)}
            </p>
          )}
        </div>
        <a
          href={readImage(attachment.url)}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
        >
          <IconDownload className="size-3.5" />
          Download file
        </a>
      </div>
    </Dialog.Content>
  );
}

function FileAttachment({
  attachment,
}: Readonly<{
  attachment: IAttachment;
}>) {
  return (
    <Dialog>
      <FileAttachmentTrigger attachment={attachment} />
      <FileAttachmentPreview attachment={attachment} />
    </Dialog>
  );
}

function ImageAttachment({
  attachment,
  single,
  onUnavailable,
}: Readonly<{
  attachment: IAttachment;
  single: boolean;
  onUnavailable: () => void;
}>) {
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
          <InboxImage
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
        <InboxImage
          src={readImage(attachment.url)}
          alt={attachment.name}
          className="block h-auto max-h-[88vh] w-auto max-w-[90vw] rounded-lg object-contain"
        />
      </Dialog.Content>
    </Dialog>
  );
}

function Attachment({
  attachment,
  length,
  onUnavailable,
}: Readonly<{
  attachment: IAttachment;
  length?: number;
  onUnavailable: () => void;
}>) {
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
      <VideoAttachment attachment={attachment} onUnavailable={onUnavailable} />
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
    return <FileAttachment attachment={attachment} />;
  }
  return (
    <ImageAttachment
      attachment={attachment}
      single={single}
      onUnavailable={onUnavailable}
    />
  );
}
