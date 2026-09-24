import { IconFile, IconMusic, IconX } from '@tabler/icons-react';
import { Button, Dialog, readImage, type IAttachment } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type ComposerAttachmentProps = {
  attachment: IAttachment;
  onRemove: () => void;
};

type AttachmentKind = 'image' | 'video' | 'audio' | 'file';

const getAttachmentKind = (attachment: IAttachment): AttachmentKind => {
  const type = attachment.type?.toLowerCase();
  const filename = `${attachment.name} ${attachment.url}`.toLowerCase();

  if (
    type?.startsWith('image') ||
    /\.(avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)(\?|\s|$)/.test(filename)
  ) {
    return 'image';
  }
  if (
    type?.startsWith('video') ||
    /\.(m4v|mkv|mov|mp4|ogv|webm)(\?|\s|$)/.test(filename)
  ) {
    return 'video';
  }
  if (
    type?.startsWith('audio') ||
    /\.(aac|flac|m4a|mp3|oga|ogg|wav)(\?|\s|$)/.test(filename)
  ) {
    return 'audio';
  }
  return 'file';
};

const PreviewImage = ({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className: string;
}) => (
  // skipcq: JS-W1015
  <img src={src} alt={label} className={className} />
);

const PreviewVideo = ({
  src,
  label,
  className,
  controls = false,
}: {
  src: string;
  label: string;
  className: string;
  controls?: boolean;
}) => (
  <video
    src={src}
    aria-label={label}
    controls={controls}
    muted={!controls}
    playsInline
    preload="metadata"
    className={className}
  >
    <track kind="captions" />
  </video>
);

const PreviewAudio = ({ src, label }: { src: string; label: string }) => (
  <audio
    src={src}
    aria-label={label}
    controls
    preload="metadata"
    className="w-full min-w-64"
  >
    <track kind="captions" />
  </audio>
);

const AttachmentThumbnailContent = ({
  kind,
  source,
  label,
}: {
  kind: AttachmentKind;
  source: string;
  label: string;
}) => {
  if (kind === 'image') {
    return (
      <PreviewImage
        src={source}
        label={label}
        className="size-full object-cover"
      />
    );
  }

  if (kind === 'video') {
    return (
      <PreviewVideo
        src={source}
        label={label}
        className="pointer-events-none size-full object-cover"
      />
    );
  }

  if (kind === 'audio') {
    return <IconMusic className="size-4" />;
  }

  return <IconFile className="size-4" />;
};

const AttachmentThumbnail = ({
  kind,
  source,
  label,
}: {
  kind: AttachmentKind;
  source: string;
  label: string;
}) => (
  <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
    <AttachmentThumbnailContent kind={kind} source={source} label={label} />
  </span>
);

const AttachmentPreview = ({
  kind,
  source,
  label,
}: {
  kind: AttachmentKind;
  source: string;
  label: string;
}) => {
  const { t } = useTranslation('frontline');

  if (kind === 'image') {
    return (
      <PreviewImage
        src={source}
        label={label}
        className="max-h-[70vh] w-full rounded-lg object-contain"
      />
    );
  }

  if (kind === 'video') {
    return (
      <PreviewVideo
        src={source}
        label={label}
        controls
        className="max-h-[70vh] w-full rounded-lg bg-black object-contain"
      />
    );
  }

  if (kind === 'audio') {
    return <PreviewAudio src={source} label={label} />;
  }

  return (
    <a
      href={source}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-lg border bg-muted/40 p-4 text-sm text-primary underline"
    >
      {t('open-attachment', 'Open attachment')}
    </a>
  );
};

const AttachmentDialogContent = ({
  attachment,
  kind,
  label,
}: {
  attachment: IAttachment;
  kind: AttachmentKind;
  label: string;
}) => {
  const source = readImage(attachment.url);

  return (
    <Dialog.Content className="max-w-3xl">
      <Dialog.Header>
        <Dialog.Title>{label}</Dialog.Title>
      </Dialog.Header>
      <AttachmentPreview kind={kind} source={source} label={label} />
    </Dialog.Content>
  );
};

const AttachmentTrigger = ({
  attachment,
  kind,
  label,
  source,
  onOpen,
}: {
  attachment: IAttachment;
  kind: AttachmentKind;
  label: string;
  source: string;
  onOpen: () => void;
}) => (
  <button
    type="button"
    aria-haspopup="dialog"
    onClick={onOpen}
    className="flex min-w-0 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
  >
    <AttachmentThumbnail kind={kind} source={source} label={label} />
    <span className="min-w-0 max-w-40">
      <span className="block truncate text-xs font-medium">{label}</span>
      <span className="block text-[11px] text-muted-foreground">
        {attachment.size > 0
          ? `${Math.max(1, Math.round(attachment.size / 1024))} KB`
          : kind}
      </span>
    </span>
  </button>
);

export const ComposerAttachment = ({
  attachment,
  onRemove,
}: ComposerAttachmentProps) => {
  const { t } = useTranslation('frontline');
  const [previewOpen, setPreviewOpen] = useState(false);
  const kind = getAttachmentKind(attachment);
  let fallbackLabel = t('attachment', 'Attachment');
  if (kind === 'image') fallbackLabel = t('photo', 'Photo');
  if (kind === 'video') fallbackLabel = t('video', 'Video');
  if (kind === 'audio') fallbackLabel = t('audio', 'Audio');
  const label = attachment.name || fallbackLabel;
  const source = readImage(attachment.url);

  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border bg-muted/35 p-1.5 pr-2 shadow-xs">
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <AttachmentTrigger
          attachment={attachment}
          kind={kind}
          label={label}
          source={source}
          onOpen={() => setPreviewOpen(true)}
        />
        <AttachmentDialogContent
          attachment={attachment}
          kind={kind}
          label={label}
        />
      </Dialog>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={t('remove-attachment', 'Remove {{name}}', { name: label })}
        onClick={onRemove}
        className="size-7 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <IconX className="size-3.5" />
      </Button>
    </div>
  );
};
