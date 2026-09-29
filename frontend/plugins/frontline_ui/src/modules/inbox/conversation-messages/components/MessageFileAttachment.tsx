import { attachmentName } from '@/inbox/conversation-messages/utils/attachmentName';
import { IconArrowUpRight } from '@tabler/icons-react';
import { Button, formatBytes, getFileIcon, readImage } from 'erxes-ui';
import type { IAttachment } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MessageFileAttachment = ({
  attachment,
}: {
  attachment: IAttachment;
}) => {
  const { t } = useTranslation('frontline');
  const name = attachmentName(attachment) || t('file', 'File');

  return (
    <Button
      variant="outline"
      asChild
      className="h-auto w-64 max-w-full justify-start gap-3 rounded-lg border-border/60 bg-muted/30 px-3 py-2 text-foreground shadow-none hover:bg-muted/60"
    >
      <a
        href={readImage(attachment.url)}
        target="_blank"
        rel="noopener noreferrer"
        title={name}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
          {getFileIcon(attachment.type || '', name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5">
          <span className="w-full truncate text-xs font-medium">{name}</span>
          {attachment.size > 0 && (
            <span className="text-[11px] font-normal text-muted-foreground">
              {formatBytes(attachment.size)}
            </span>
          )}
        </span>
        <IconArrowUpRight className="size-3.5 shrink-0 text-muted-foreground" />
      </a>
    </Button>
  );
};
