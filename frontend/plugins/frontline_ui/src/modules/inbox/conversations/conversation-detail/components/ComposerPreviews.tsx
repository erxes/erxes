import {
  IconArrowBackUp,
  IconFile,
  IconMovie,
  IconPhoto,
  IconX,
} from '@tabler/icons-react';
import { Button, Dialog, Spinner, readImage, type IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

import {
  AttachmentPreview,
  ComposerAttachment,
} from '@/inbox/conversations/conversation-detail/components/ComposerAttachment';
import { getAttachmentKind } from '@/inbox/conversations/conversation-detail/utils/composerAttachment';
import type { PendingAttachment } from '@/inbox/conversations/conversation-detail/types/composerAttachments';
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

export const ComposerReplyPreview = ({
  replyTo,
  onCancel,
}: {
  replyTo: MessageReplyTarget;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex h-8 min-w-0 items-center gap-2 border-l border-border/60 pl-3 text-xs text-muted-foreground">
      <IconArrowBackUp className="size-3.5 shrink-0" aria-hidden="true" />
      {replyTo.attachment?.url && (
        <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded">
          <ReplyAttachmentPreview replyTo={replyTo} />
        </span>
      )}
      <span
        className="max-w-[45%] shrink-0 truncate font-medium text-foreground/80"
        title={replyTo.authorName || t('message', 'message')}
      >
        {replyTo.nativeReply
          ? t('replying-to', 'Replying to:')
          : t('quoting', 'Quoting')}{' '}
        {replyTo.authorName || t('message', 'message')}
      </span>
      <span className="min-w-0 flex-1 truncate" title={replyTo.preview}>
        {replyTo.preview}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('cancel-reply', 'Cancel reply')}
        onClick={onCancel}
        className="size-6 shrink-0 rounded-full text-muted-foreground"
      >
        <IconX className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
};

const formatUploadedSize = (size: number) =>
  `${Math.max(1, Math.round(size / 1024))} KB`;

const PendingAttachmentItem = ({
  file,
  onRemove,
}: {
  file: PendingAttachment;
  onRemove: (url: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const { uploadedUrl } = file;

  return (
    <div className="flex min-w-48 items-center gap-2 rounded-xl border bg-muted/35 p-2">
      <Dialog>
        <Dialog.Trigger asChild>
          <button
            type="button"
            disabled={!uploadedUrl}
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
              <PendingAttachmentPreview file={file} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-medium">
                {file.name}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {uploadedUrl
                  ? formatUploadedSize(file.size)
                  : t('uploading', 'Uploading...')}
              </span>
            </span>
          </button>
        </Dialog.Trigger>
        {uploadedUrl && (
          <Dialog.Content className="max-w-3xl">
            <Dialog.Header>
              <Dialog.Title>{file.name}</Dialog.Title>
            </Dialog.Header>
            <AttachmentPreview
              kind={getAttachmentKind({ ...file, url: uploadedUrl })}
              source={file.previewUrl || readImage(uploadedUrl)}
              label={file.name}
            />
          </Dialog.Content>
        )}
      </Dialog>
      {uploadedUrl ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('remove-attachment', 'Remove {{name}}', {
            name: file.name,
          })}
          onClick={() => onRemove(uploadedUrl)}
          className="size-7 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <IconX className="size-3.5" />
        </Button>
      ) : (
        <Spinner size="sm" />
      )}
    </div>
  );
};

type ComposerPreviewsProps = {
  attachments: IAttachment[];
  blockAttachments: IAttachment[];
  pendingAttachments: PendingAttachment[];
  onRemove: (url: string) => void;
  onRemoveBlockAttachment: (url: string) => void;
};

export const ComposerPreviews = ({
  attachments,
  blockAttachments,
  pendingAttachments,
  onRemove,
  onRemoveBlockAttachment,
}: ComposerPreviewsProps) => {
  const previewedUrls = new Set(
    pendingAttachments.flatMap(({ uploadedUrl }) =>
      uploadedUrl ? [uploadedUrl] : [],
    ),
  );
  if (
    !attachments.length &&
    !blockAttachments.length &&
    !pendingAttachments.length
  )
    return null;

  return (
    <>
      {pendingAttachments.map((file) => (
        <PendingAttachmentItem key={file.id} file={file} onRemove={onRemove} />
      ))}
      {attachments
        .filter((attachment) => !previewedUrls.has(attachment.url))
        .map((attachment) => (
          <ComposerAttachment
            key={attachment.url}
            attachment={attachment}
            onRemove={() => onRemove(attachment.url)}
          />
        ))}
      {blockAttachments.map((attachment, index) => (
        <ComposerAttachment
          key={`block-${attachment.url}-${index}`}
          attachment={attachment}
          onRemove={() => onRemoveBlockAttachment(attachment.url)}
        />
      ))}
    </>
  );
};
