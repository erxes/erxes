import { useTranslation } from 'react-i18next';
import { cn, formatBytes } from 'erxes-ui';
import { IconAlertTriangle } from '@tabler/icons-react';
import { daysUntil } from '@/activity/utils/daysUntil';
import type { NoteUnsavedAttachmentProps } from '@/activity/types';

export const NoteUnsavedAttachment = ({
  attachment,
}: NoteUnsavedAttachmentProps) => {
  const { t } = useTranslation('frontline');
  const daysLeft = daysUntil(attachment.expiresAt);
  const link = attachment.url && daysLeft > 0 ? attachment.url : '';

  const status = link
    ? t(
        'attachment-not-saved-days',
        'Not saved · the link works for {{count}} more days',
        { count: daysLeft },
      )
    : t(
        'attachment-unavailable',
        'This attachment could not be stored and is no longer available',
      );

  const body = (
    <>
      <IconAlertTriangle className="size-8 shrink-0 text-warning" />
      <div className="flex min-w-0 flex-col">
        <span
          className={cn(
            'truncate text-sm font-medium',
            link ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {attachment.name || 'File'}
          {Boolean(attachment.size) && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {formatBytes(attachment.size ?? 0)}
            </span>
          )}
        </span>
        <span className="text-xs text-warning">{status}</span>
      </div>
    </>
  );

  const className =
    'flex w-full items-center gap-3 rounded border border-warning/40 bg-warning/10 px-3 py-2 no-underline';

  if (!link) {
    return (
      <div className={className} title={attachment.error ?? undefined}>
        {body}
      </div>
    );
  }

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      title={attachment.error ?? undefined}
      className={cn(className, 'hover:bg-warning/20')}
    >
      {body}
    </a>
  );
};
