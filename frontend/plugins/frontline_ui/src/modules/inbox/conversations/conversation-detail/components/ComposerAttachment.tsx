import { IconFile, IconX } from '@tabler/icons-react';
import { Button, Dialog, readImage, type IAttachment } from 'erxes-ui';

type ComposerAttachmentProps = {
  attachment: IAttachment;
  onRemove: () => void;
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
  <svg role="img" aria-label={label} className={className}>
    <image
      href={src}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    />
  </svg>
);

const AttachmentThumbnail = ({
  isImage,
  source,
  label,
}: {
  isImage: boolean;
  source: string;
  label: string;
}) => (
  <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
    {isImage ? (
      <PreviewImage
        src={source}
        label={label}
        className="size-full object-cover"
      />
    ) : (
      <IconFile className="size-4" />
    )}
  </span>
);

const AttachmentDialogContent = ({
  attachment,
  isImage,
  label,
}: {
  attachment: IAttachment;
  isImage: boolean;
  label: string;
}) => {
  const source = readImage(attachment.url);

  return (
    <Dialog.Content className="max-w-3xl">
      <Dialog.Header>
        <Dialog.Title>{label}</Dialog.Title>
      </Dialog.Header>
      {isImage ? (
        <PreviewImage
          src={source}
          label={label}
          className="max-h-[70vh] w-full rounded-lg object-contain"
        />
      ) : (
        <a
          href={source}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border bg-muted/40 p-4 text-sm text-primary underline"
        >
          Open attachment
        </a>
      )}
    </Dialog.Content>
  );
};

export const ComposerAttachment = ({
  attachment,
  onRemove,
}: ComposerAttachmentProps) => {
  const isImage = attachment.type.startsWith('image');
  const label = attachment.name || (isImage ? 'Photo' : 'Attachment');
  const source = readImage(attachment.url);

  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border bg-muted/35 p-1.5 pr-2 shadow-xs">
      <Dialog>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <AttachmentThumbnail
              isImage={isImage}
              source={source}
              label={label}
            />
            <span className="min-w-0 max-w-40">
              <span className="block truncate text-xs font-medium">
                {label}
              </span>
              <span className="block text-[11px] text-muted-foreground">
                {Math.max(1, Math.round(attachment.size / 1024))} KB
              </span>
            </span>
          </button>
        </Dialog.Trigger>
        <AttachmentDialogContent
          attachment={attachment}
          isImage={isImage}
          label={label}
        />
      </Dialog>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        className="size-7 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <IconX className="size-3.5" />
      </Button>
    </div>
  );
};
