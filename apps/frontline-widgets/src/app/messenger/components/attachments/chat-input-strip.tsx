import { useState } from 'react';
import { IconDownload, IconFileAlert, IconX } from '@tabler/icons-react';
import { Button, Dialog, type IAttachment, readImage, Spinner } from 'erxes-ui';
import { formatFileSize, getAttachmentType } from '@libs/format-file';
import { Attachment } from './attachment';
import { getAttachmentIcon } from './attachment-type';
import { PreviewImage } from './preview-image';
import {
  downloadAttachmentFile,
  type PendingFile,
} from '../../utils/fileUpload';

function UploadedAttachment({
  attachment,
  onRemove,
}: {
  attachment: IAttachment;
  onRemove: () => void;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const fileType = getAttachmentType(attachment.type, attachment.name);
  const FileTypeIcon = getAttachmentIcon(fileType);
  const isImage = fileType === 'image';

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await downloadAttachmentFile(
        readImage(attachment.url),
        attachment.name || 'File',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  if (!isImage) {
    return (
      <Attachment size="sm" state="done">
        <Attachment.Media>
          <FileTypeIcon />
        </Attachment.Media>
        <Attachment.Content>
          <Attachment.Title>{attachment.name}</Attachment.Title>
          <Attachment.Description>
            {formatFileSize(attachment.size || 0)}
          </Attachment.Description>
        </Attachment.Content>
        <Attachment.Actions>
          <Attachment.Action
            type="button"
            aria-label={`Download ${attachment.name}`}
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? <Spinner /> : <IconDownload />}
          </Attachment.Action>
          <Attachment.Action
            type="button"
            aria-label={`Remove ${attachment.name}`}
            onClick={onRemove}
          >
            <IconX />
          </Attachment.Action>
        </Attachment.Actions>
      </Attachment>
    );
  }

  return (
    <Dialog>
      <Attachment
        size="sm"
        state="done"
        className="cursor-pointer hover:bg-muted/60"
      >
        <Attachment.Media variant="image">
          <PreviewImage
            src={readImage(attachment.url)}
            alt={attachment.name}
            className="size-full"
          />
        </Attachment.Media>
        <Attachment.Content>
          <Attachment.Title>{attachment.name}</Attachment.Title>
          <Attachment.Description>
            {`${formatFileSize(attachment.size || 0)} · Preview`}
          </Attachment.Description>
        </Attachment.Content>
        <Dialog.Trigger asChild>
          <Attachment.Trigger aria-label={`Preview ${attachment.name}`} />
        </Dialog.Trigger>
        <Attachment.Actions>
          <Attachment.Action
            type="button"
            aria-label={`Remove ${attachment.name}`}
            onClick={onRemove}
          >
            <IconX />
          </Attachment.Action>
        </Attachment.Actions>
      </Attachment>
      <Dialog.Content className="max-w-2xl rounded-2xl">
        <Dialog.Header>
          <Dialog.Title className="truncate">{attachment.name}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Attachment preview for {attachment.name}
          </Dialog.Description>
        </Dialog.Header>
        <div className="flex items-center justify-center p-2">
          <PreviewImage
            src={readImage(attachment.url)}
            alt={attachment.name}
            fit="contain"
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
        <div className="flex justify-center pb-2">
          <Button
            type="button"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? <Spinner /> : <IconDownload />}
            {isDownloading ? 'Downloading…' : 'Download file'}
          </Button>
        </div>
        <Dialog.Close asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3"
            aria-label="Close attachment preview"
          >
            <IconX />
          </Button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog>
  );
}

type ChatAttachmentStripProps = {
  attachments: IAttachment[];
  pendingFiles: PendingFile[];
  isUploading: boolean;
  onRemove: (index: number) => void;
  onDismiss: (index: number) => void;
};

export function ChatAttachmentStrip({
  attachments,
  pendingFiles,
  isUploading,
  onRemove,
  onDismiss,
}: ChatAttachmentStripProps) {
  if (!attachments.length && !pendingFiles.length) return null;

  const totalQueued = attachments.length + pendingFiles.length;
  const uploadedCount = attachments.length;

  return (
    <div className="flex flex-col px-3 pt-2 gap-1.5">
      {isUploading && (
        <span className="text-[11px] text-muted-foreground">
          {uploadedCount} of {totalQueued} uploaded
        </span>
      )}
      <Attachment.Group className="hide-scroll">
        {attachments.map((attachment, index) => (
          <UploadedAttachment
            key={attachment.url}
            attachment={attachment}
            onRemove={() => onRemove(index)}
          />
        ))}
        {pendingFiles.map((pf, i) => {
          const fileType = getAttachmentType(pf.type, pf.name);
          const FileTypeIcon = getAttachmentIcon(fileType);
          const hasFailed = pf.state === 'error';

          return (
            <Attachment key={pf.id} size="sm" state={pf.state}>
              <Attachment.Media variant={pf.preview ? 'image' : 'icon'}>
                {hasFailed ? (
                  <IconFileAlert />
                ) : pf.preview ? (
                  <PreviewImage
                    src={pf.preview}
                    alt={pf.name}
                    className="size-full"
                  />
                ) : (
                  <FileTypeIcon />
                )}
                {pf.state === 'uploading' && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/60">
                    <Spinner size="sm" />
                  </span>
                )}
              </Attachment.Media>
              <Attachment.Content>
                <Attachment.Title>{pf.name}</Attachment.Title>
                <Attachment.Description>
                  {hasFailed
                    ? pf.error || 'Upload failed. Remove and try again.'
                    : 'Uploading'}
                </Attachment.Description>
              </Attachment.Content>
              <Attachment.Actions>
                <Attachment.Action
                  type="button"
                  aria-label={
                    hasFailed ? `Dismiss ${pf.name}` : `Cancel ${pf.name}`
                  }
                  onClick={() => onDismiss(i)}
                >
                  <IconX />
                </Attachment.Action>
              </Attachment.Actions>
            </Attachment>
          );
        })}
      </Attachment.Group>
    </div>
  );
}
