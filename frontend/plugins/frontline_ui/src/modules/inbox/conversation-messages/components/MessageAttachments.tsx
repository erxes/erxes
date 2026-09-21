import { IconFile } from '@tabler/icons-react';
import { Dialog, cn, formatBytes, readImage, type IAttachment } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';
import { UnsupportedMessage } from '@/inbox/conversation-messages/components/MessagePresentation';

const attachmentKey = (attachment: IAttachment, index: number) =>
  `${attachment.url || 'missing'}-${index}`;

const MessageAttachment = ({
  attachment,
  single,
  onUnavailable,
}: {
  attachment: IAttachment;
  single: boolean;
  onUnavailable: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const type = attachment.type || '';
  const source = readImage(attachment.url);

  if (!attachment.url) return null;

  if (type.startsWith('video')) {
    return (
      <video
        src={source}
        controls
        playsInline
        preload="metadata"
        onError={onUnavailable}
        className="size-full max-h-96 rounded bg-black object-contain"
      >
        <track kind="captions" />
      </video>
    );
  }

  if (type.startsWith('audio')) {
    return (
      <audio
        src={source}
        controls
        preload="metadata"
        onError={onUnavailable}
        className="w-full min-w-64"
      >
        <track kind="captions" />
      </audio>
    );
  }

  if (!type.startsWith('image')) {
    return (
      <a
        href={source}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full min-w-44 max-w-xs items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5 no-underline shadow-2xs transition-colors hover:bg-muted/50"
      >
        <IconFile className="size-8 shrink-0 text-muted-foreground" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-medium text-primary">
            {attachment.name || t('file', 'File')}
          </span>
          {Boolean(attachment.size) && (
            <span className="text-xs text-muted-foreground">
              {formatBytes(attachment.size)}
            </span>
          )}
        </span>
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
          <InboxImage
            src={source}
            alt={attachment.name || ''}
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
          src={source}
          alt={attachment.name || ''}
          className="block h-auto max-h-[88vh] w-auto max-w-[90vw] rounded-lg object-contain"
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
  const { t } = useTranslation('frontline');
  const [failedKeys, setFailedKeys] = useState<Set<string>>(() => new Set());

  if (!attachments?.length) return null;

  const single = attachments.length === 1;
  const unavailableCount = attachments.filter(
    (attachment, index) =>
      !attachment.url || failedKeys.has(attachmentKey(attachment, index)),
  ).length;

  return (
    <div
      className={cn(
        single ? 'flex' : 'grid grid-cols-6 gap-1.5 overflow-hidden rounded-lg',
      )}
    >
      {attachments.map((attachment, index) => {
        const key = attachmentKey(attachment, index);
        return (
          <div
            key={key}
            className={cn(
              (!attachment.url || failedKeys.has(key)) && 'hidden',
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
            <MessageAttachment
              attachment={attachment}
              single={single}
              onUnavailable={() =>
                setFailedKeys((current) => new Set(current).add(key))
              }
            />
          </div>
        );
      })}
      {unavailableCount > 0 && (
        <div className="col-span-6">
          <UnsupportedMessage
            text={t('attachment-unavailable', 'Attachment unavailable')}
          />
        </div>
      )}
    </div>
  );
};

export { MessageAttachments as Attachments };
