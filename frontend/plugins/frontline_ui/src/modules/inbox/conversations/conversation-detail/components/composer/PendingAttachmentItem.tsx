import { IconX, IconFile, IconMovie, IconPhoto } from '@tabler/icons-react';
import { Button, Dialog, Spinner, readImage } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AttachmentPreview } from '@/inbox/conversations/conversation-detail/components/ComposerAttachment';
import {
  getAttachmentKind,
  formatUploadedSize,
} from '@/inbox/conversations/conversation-detail/utils/composerAttachment';
import type { PendingAttachment } from '@/inbox/conversations/conversation-detail/types/composerAttachments';

export const PendingImage = ({ src, alt }: { src: string; alt: string }) => (
  // skipcq: JS-W1015
  <img src={src} alt={alt} className="size-full object-cover" />
);

export const PendingVideo = ({
  src,
  label,
}: {
  src: string;
  label: string;
}) => (
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

export const PendingAttachmentPreview = ({
  file,
}: {
  file: PendingAttachment;
}) => {
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

const PendingAttachmentTrigger = ({ file }: { file: PendingAttachment }) => {
  const { t } = useTranslation('frontline');
  return (
    <Dialog.Trigger asChild>
      <button
        type="button"
        disabled={!file.uploadedUrl}
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
            {file.uploadedUrl
              ? formatUploadedSize(file.size)
              : t('uploading', 'Uploading...')}
          </span>
        </span>
      </button>
    </Dialog.Trigger>
  );
};

const PendingAttachmentDialogContent = ({
  file,
}: {
  file: PendingAttachment;
}) => {
  const { uploadedUrl } = file;
  if (!uploadedUrl) return null;
  return (
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
  );
};

export const PendingAttachmentItem = ({
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
        <PendingAttachmentTrigger file={file} />
        <PendingAttachmentDialogContent file={file} />
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
