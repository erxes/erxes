import {
  IconAlertCircle,
  IconFileText,
  IconLoader2,
  IconX,
} from '@tabler/icons-react';
import { PendingAttachment } from '~/modules/chat/types';
import { formatFileSize } from '~/modules/chat/utils';

export const ComposerAttachmentChip = ({
  att,
  onRemove,
}: {
  att: PendingAttachment;
  onRemove: () => void;
}) => (
  <div
    className={`ea-pop flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs max-w-56 transition-colors ${
      att.status === 'error'
        ? 'border-destructive/40 bg-destructive/8 text-destructive'
        : 'border-border bg-muted/50 hover:bg-muted'
    }`}
    title={att.status === 'error' ? att.error : att.name}
  >
    {att.status === 'uploading' ? (
      <IconLoader2 className="size-3.5 shrink-0 animate-spin text-primary" />
    ) : att.status === 'error' ? (
      <IconAlertCircle className="size-3.5 shrink-0" />
    ) : att.previewUrl ? (
      <img
        src={att.previewUrl}
        alt={att.name}
        className="size-6 shrink-0 rounded object-cover border border-border/60"
      />
    ) : (
      <IconFileText className="size-3.5 shrink-0 text-muted-foreground" />
    )}
    <span className="truncate">{att.name}</span>
    {att.size ? (
      <span className="text-muted-foreground shrink-0">
        {formatFileSize(att.size)}
      </span>
    ) : null}
    <button
      type="button"
      onClick={onRemove}
      className="shrink-0 rounded hover:bg-black/8 dark:hover:bg-white/10 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
    >
      <IconX className="size-3" />
    </button>
  </div>
);
