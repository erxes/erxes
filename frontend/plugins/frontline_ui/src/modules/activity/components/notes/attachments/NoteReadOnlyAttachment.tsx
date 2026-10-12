import { cn, readImage, formatBytes } from 'erxes-ui';
import { IconFile } from '@tabler/icons-react';
import type { NoteReadOnlyAttachmentProps } from '@/activity/types';

export const NoteReadOnlyAttachment = ({
  attachment,
  single,
}: NoteReadOnlyAttachmentProps) => {
  if (attachment.type?.startsWith('image')) {
    return (
      <a
        href={readImage(attachment.url)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={readImage(attachment.url, 400)}
          alt={attachment.name || 'attachment'}
          className={cn(
            'rounded object-cover',
            single ? 'max-h-72 max-w-sm' : 'h-32 w-full',
          )}
        />
      </a>
    );
  }

  return (
    <a
      href={readImage(attachment.url)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-full items-center gap-3 rounded bg-accent px-3 py-2 no-underline hover:bg-accent/70"
    >
      <IconFile className="size-8 shrink-0 text-muted-foreground" />
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-primary">
          {attachment.name || 'File'}
        </span>
        {Boolean(attachment.size) && (
          <span className="text-xs text-muted-foreground">
            {formatBytes(attachment.size)}
          </span>
        )}
      </div>
    </a>
  );
};
