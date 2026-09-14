import { IconFile, IconX } from '@tabler/icons-react';
import { Button, Dialog, readImage } from 'erxes-ui';

import { InboxImage } from '@/inbox/conversation-messages/components/InboxImage';

import type { IAttachment } from 'erxes-ui';

type ComposerAttachmentProps = {
  attachment: IAttachment;
  onRemove: () => void;
};

type AttachmentContentProps = {
  attachment: IAttachment;
  isImage: boolean;
};

const AttachmentThumbnail = ({
  attachment,
  isImage,
}: AttachmentContentProps) =>
  isImage ? (
    <InboxImage
      src={readImage(attachment.url)}
      alt={attachment.name || 'Photo'}
      className="size-full object-cover"
    />
  ) : (
    <IconFile className="size-4" />
  );

const AttachmentPreview = ({ attachment, isImage }: AttachmentContentProps) =>
  isImage ? (
    <InboxImage
      src={readImage(attachment.url)}
      alt={attachment.name || 'Photo preview'}
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
  );

const AttachmentTrigger = ({ attachment, isImage }: AttachmentContentProps) => (
  <button
    type="button"
    className="flex min-w-0 items-center gap-2 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
  >
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-background text-muted-foreground">
      <AttachmentThumbnail attachment={attachment} isImage={isImage} />
    </span>
    <span className="min-w-0 max-w-40">
      <span className="block truncate text-xs font-medium">
        {attachment.name || (isImage ? 'Photo' : 'Attachment')}
      </span>
      <span className="block text-[11px] text-muted-foreground">
        {isImage ? 'Photo · Click to preview' : 'Click to preview'}
      </span>
    </span>
  </button>
);

const AttachmentDialog = ({ attachment, isImage }: AttachmentContentProps) => (
  <Dialog.Content className="max-w-3xl">
    <Dialog.Header>
      <Dialog.Title>{attachment.name || 'Attachment'}</Dialog.Title>
    </Dialog.Header>
    <AttachmentPreview attachment={attachment} isImage={isImage} />
  </Dialog.Content>
);

export const ComposerAttachment = ({
  attachment,
  onRemove,
}: ComposerAttachmentProps) => {
  const isImage = Boolean(attachment.type?.startsWith('image'));

  return (
    <div className="flex min-w-0 max-w-full items-center gap-2 rounded-xl border bg-muted/35 p-1.5 pr-2 shadow-xs">
      <Dialog>
        <Dialog.Trigger asChild>
          <AttachmentTrigger attachment={attachment} isImage={isImage} />
        </Dialog.Trigger>
        <AttachmentDialog attachment={attachment} isImage={isImage} />
      </Dialog>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={`Remove ${attachment.name || 'attachment'}`}
        onClick={onRemove}
        className="shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <IconX className="size-3.5" />
      </Button>
    </div>
  );
};
