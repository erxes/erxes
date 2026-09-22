import {
  IconArrowBackUp,
  IconFile,
  IconMovie,
  IconPhoto,
  IconX,
} from '@tabler/icons-react';
import { Button, Spinner, readImage, type IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import { ComposerAttachment } from '@/inbox/conversations/conversation-detail/components/ComposerAttachment';
import type { PendingAttachment } from '@/inbox/conversations/conversation-detail/hooks/useMessageAttachments';
import type { MessageReplyTarget } from '@/inbox/conversations/conversation-detail/states/messageReplyState';

const PendingImage = ({ src, alt }: { src: string; alt: string }) => (
  // skipcq: JS-W1015
  <img src={src} alt={alt} className="size-full object-cover" />
);

const PendingVideo = ({ src, label }: { src: string; label: string }) => (
  <video
    src={src}
    aria-label={label}
    muted
    playsInline
    preload="metadata"
    className="pointer-events-none size-full object-cover"
  >
    <track kind="captions" />
  </video>
);

const PendingAttachmentPreview = ({ file }: { file: PendingAttachment }) => {
  if (file.previewUrl && file.type.startsWith('image/')) {
    return <PendingImage src={file.previewUrl} alt={file.name} />;
  }

  if (file.previewUrl && file.type.startsWith('video/')) {
    return <PendingVideo src={file.previewUrl} label={file.name} />;
  }

  if (file.type.startsWith('image/')) {
    return <IconPhoto className="size-4" />;
  }

  if (file.type.startsWith('video/')) {
    return <IconMovie className="size-4" />;
  }

  return <IconFile className="size-4" />;
};

const ReplyAttachmentPreview = ({
  replyTo,
}: {
  replyTo: MessageReplyTarget;
}) => {
  const { attachment } = replyTo;

  if (!attachment?.url) return null;

  const source = readImage(attachment.url);
  const label = attachment.name || 'Reply attachment';

  if (attachment.type?.startsWith('image')) {
    return <PendingImage src={source} alt={label} />;
  }

  if (attachment.type?.startsWith('video')) {
    return <PendingVideo src={source} label={label} />;
  }

  return <IconFile className="size-4" />;
};

const ReplyPreview = ({
  replyTo,
  onCancel,
}: {
  replyTo: MessageReplyTarget;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/55 px-3 py-2 text-sm">
      <div className="flex min-w-0 items-center gap-2.5 text-muted-foreground">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <IconArrowBackUp className="size-4" />
        </span>
        {replyTo.attachment?.url && (
          <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background">
            <ReplyAttachmentPreview replyTo={replyTo} />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-xs font-semibold text-foreground">
            {replyTo.nativeReply
              ? t('replying-to', 'Replying to:')
              : t('quoting', 'Quoting')}{' '}
            {replyTo.authorName || t('message', 'message')}
          </span>
          <span className="block truncate text-xs">{replyTo.preview}</span>
        </span>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('cancel-reply', 'Cancel reply')}
        onClick={onCancel}
        className="size-7 shrink-0 rounded-full text-muted-foreground"
      >
        <IconX className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
};

type ComposerPreviewsProps = {
  attachments: IAttachment[];
  pendingAttachments: PendingAttachment[];
  replyTo: MessageReplyTarget | null;
  onRemove: (url: string) => void;
  onCancelReply: () => void;
};

export const ComposerPreviews = ({
  attachments,
  pendingAttachments,
  replyTo,
  onRemove,
  onCancelReply,
}: ComposerPreviewsProps) => {
  const { t } = useTranslation('frontline');
  if (!replyTo && !attachments.length && !pendingAttachments.length)
    return null;

  return (
    <div className="flex max-h-44 flex-none flex-col gap-2 overflow-y-auto border-b border-border/50 p-2 sm:px-3">
      {replyTo && <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />}
      {(pendingAttachments.length > 0 || attachments.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {pendingAttachments.map((file) => (
            <div
              key={file.id}
              className="flex min-w-48 items-center gap-2 rounded-xl border bg-muted/35 p-2"
            >
              <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
                <PendingAttachmentPreview file={file} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium">
                  {file.name}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {t('uploading', 'Uploading...')}
                </span>
              </span>
              <Spinner size="sm" />
            </div>
          ))}
          {attachments.map((attachment) => (
            <ComposerAttachment
              key={attachment.url}
              attachment={attachment}
              onRemove={() => onRemove(attachment.url)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
