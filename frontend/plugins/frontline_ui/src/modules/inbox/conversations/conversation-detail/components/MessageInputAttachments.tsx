import { IconX } from '@tabler/icons-react';
import {
  Button,
  IAttachment,
  Spinner,
  cn,
  formatBytes,
  getFileIcon,
  readImage,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export type PendingAttachment = {
  name: string;
  size: number;
  type: string;
  data: string;
};

type MessageInputAttachmentsProps = {
  attachments: IAttachment[];
  pending?: PendingAttachment | null;
  onRemove: (name: string) => void;
};

export const MessageInputAttachments = ({
  attachments,
  pending,
  onRemove,
}: MessageInputAttachmentsProps) => {
  if (!pending && attachments.length === 0) return null;

  return (
    <div className="mx-6 flex max-h-40 shrink-0 flex-col divide-y divide-border overflow-y-auto rounded-md border border-border bg-background">
      {pending && (
        <AttachmentRow
          name={pending.name}
          size={pending.size}
          type={pending.type}
          thumbnail={
            pending.type.startsWith('image/') ? pending.data : undefined
          }
          uploading
        />
      )}
      {attachments.map((file) => (
        <AttachmentRow
          key={file.url}
          name={file.name}
          size={file.size}
          type={file.type}
          thumbnail={
            file.type.startsWith('image/') ? readImage(file.url) : undefined
          }
          onRemove={() => onRemove(file.name)}
        />
      ))}
    </div>
  );
};

const AttachmentRow = ({
  name,
  size,
  type,
  thumbnail,
  uploading,
  onRemove,
}: {
  name: string;
  size: number;
  type: string;
  thumbnail?: string;
  uploading?: boolean;
  onRemove?: () => void;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="group flex items-center gap-3 px-3 py-2">
      <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-muted">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={name}
            className="size-full object-cover"
          />
        ) : (
          getFileIcon(type, name)
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm" title={name}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground">
          {uploading ? t('uploading') : formatBytes(size, 2)}
        </p>
      </div>

      {onRemove && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'size-6 shrink-0 text-muted-foreground opacity-0 transition-opacity',
            'group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive',
            'focus-visible:opacity-100',
          )}
          onClick={onRemove}
          aria-label={`${t('remove')} ${name}`}
        >
          <IconX size={14} />
        </Button>
      )}
    </div>
  );
};
