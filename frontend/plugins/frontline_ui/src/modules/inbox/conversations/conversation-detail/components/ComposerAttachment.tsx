import { IconFile, IconX } from '@tabler/icons-react';
import { Button, Dialog, readImage, type IAttachment } from 'erxes-ui';

type ComposerAttachmentProps = {
  attachment: IAttachment;
  onRemove: () => void;
};

export const ComposerAttachment = ({
  attachment,
  onRemove,
}: ComposerAttachmentProps) => {
  const isImage = attachment.type.startsWith('image');
  const label = attachment.name || (isImage ? 'Photo' : 'Attachment');

  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border bg-muted/35 p-1.5 pr-2 shadow-xs">
      <Dialog>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
              {isImage ? (
                <img
                  src={readImage(attachment.url)}
                  alt={label}
                  className="size-full object-cover"
                />
              ) : (
                <IconFile className="size-4" />
              )}
            </span>
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
        <Dialog.Content className="max-w-3xl">
          <Dialog.Header>
            <Dialog.Title>{label}</Dialog.Title>
          </Dialog.Header>
          {isImage ? (
            <img
              src={readImage(attachment.url)}
              alt={label}
              className="max-h-[70vh] w-full rounded-lg object-contain"
            />
          ) : (
            <a
              href={readImage(attachment.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border bg-muted/40 p-4 text-sm text-primary underline"
            >
              Open attachment
            </a>
          )}
        </Dialog.Content>
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
