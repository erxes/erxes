import { IconDownload, IconRefresh, IconX } from '@tabler/icons-react';
import { Button, Spinner, formatBytes, getFileIcon } from 'erxes-ui';
import { useState, type ReactNode } from 'react';

import { agentsFileKindLabel } from '../utils/agentAttachments';

export interface IAgentAttachmentCardProps {
  name: string;
  mimeType: string;
  size: number;
  /** Local object URL or stored image URL for a thumbnail. */
  previewUrl?: string;
  status?: 'uploading' | 'ready' | 'error';
  error?: string;
  onRemove?: () => void;
  onRetry?: () => void;
  /** Sent attachments: the whole card opens the stored file. */
  onOpen?: () => void;
}

/** One attachment, identical in the composer and in a sent message. */
export const AgentAttachmentCard = ({
  name,
  mimeType,
  size,
  previewUrl,
  status = 'ready',
  error,
  onRemove,
  onRetry,
  onOpen,
}: IAgentAttachmentCardProps) => {
  const [previewFailed, setPreviewFailed] = useState(false);
  const showPreview = Boolean(previewUrl) && !previewFailed;

  const thumbnail = (
    <span className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
      {showPreview ? (
        <img
          src={previewUrl}
          alt=""
          className="size-full object-cover"
          onError={() => setPreviewFailed(true)}
        />
      ) : (
        getFileIcon(mimeType, name)
      )}
      {status === 'uploading' && (
        <span className="absolute inset-0 flex items-center justify-center bg-background/70">
          <Spinner className="size-4" />
        </span>
      )}
    </span>
  );

  let detail: ReactNode = `${agentsFileKindLabel(mimeType)} · ${formatBytes(size, 2)}`;
  if (status === 'uploading') {
    detail = (
      <span role="status" className="text-muted-foreground">
        Uploading…
      </span>
    );
  } else if (status === 'error') {
    detail = (
      <span role="alert" className="text-destructive" title={error}>
        {error || 'Upload failed.'}
      </span>
    );
  }

  const body = (
    <>
      {thumbnail}
      <span className="flex min-w-0 flex-1 flex-col text-left">
        <span className="truncate text-xs font-medium" title={name}>
          {name}
        </span>
        <span className="truncate text-[11px] leading-4 text-muted-foreground">
          {detail}
        </span>
      </span>
    </>
  );

  if (onOpen) {
    return (
      <Button
        type="button"
        variant="ghost"
        aria-label={`Open ${name}`}
        title={name}
        className="flex h-auto w-60 min-w-0 max-w-full items-center justify-start gap-2.5 rounded-xl border bg-background/60 p-1.5 pr-2.5 font-normal hover:bg-muted"
        onClick={onOpen}
      >
        {body}
        <IconDownload
          className="size-3.5 shrink-0 text-muted-foreground"
          aria-hidden
        />
      </Button>
    );
  }

  return (
    <div
      className={`flex w-60 min-w-0 max-w-full items-center gap-2.5 rounded-xl border bg-background/60 p-1.5 pr-1 ${
        status === 'error' ? 'border-destructive/40' : ''
      }`}
    >
      {body}
      {status === 'error' && onRetry && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onRetry}
          aria-label={`Retry ${name}`}
          title="Retry upload"
        >
          <IconRefresh className="size-3.5" />
        </Button>
      )}
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
          onClick={onRemove}
          aria-label={`Remove ${name}`}
        >
          <IconX className="size-3.5" />
        </Button>
      )}
    </div>
  );
};
