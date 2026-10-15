import React from 'react';
import { ContextMenu, cn, readImage, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IconArrowBackUp,
  IconCopy,
  IconMailForward,
  IconMailPlus,
  IconPaperclip,
  IconUsers,
} from '@tabler/icons-react';
import type {
  Attachment,
  EmailAddress,
  MailMessage,
} from '@/integrations/mail/types/mailThread';
import { formatAttachmentSize } from '@/integrations/mail/utils/mailThread';
import { useMailThreadActions } from '@/integrations/mail/hooks/useMailThreadActions';

export const AttachmentChip: React.FC<{ attachment: Attachment }> = ({
  attachment,
}) => {
  const { t } = useTranslation('frontline');
  const href = attachment.url ? readImage(attachment.url) : '';

  const content = (
    <>
      <IconPaperclip size={13} className="text-[#5f6368] flex-none" />
      <span className="max-w-[160px] truncate">
        {attachment.filename || 'attachment'}
      </span>
      {Boolean(attachment.size) && (
        <span className="text-[#5f6368]">
          {formatAttachmentSize(attachment.size)}
        </span>
      )}
    </>
  );

  const chip =
    'flex items-center gap-1.5 rounded-lg border border-[rgba(0,0,0,0.12)] ' +
    'dark:border-[rgba(255,255,255,0.1)] px-3 py-2 text-[12px] ' +
    'text-[#3c4043] dark:text-[#e8eaed] transition-colors no-underline';

  if (!href) {
    return (
      <span
        className={cn(chip, 'cursor-not-allowed opacity-60')}
        title={
          attachment.error
            ? `${t('attachment-unavailable')}: ${attachment.error}`
            : t('attachment-unavailable')
        }
      >
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(chip, 'cursor-pointer hover:bg-background/4')}
      title={
        attachment.error
          ? `${attachment.filename || 'attachment'} — ${attachment.error}`
          : attachment.filename || 'attachment'
      }
    >
      {content}
    </a>
  );
};

export const SenderContextMenu = ({
  message,
  sender,
  children,
}: {
  message: MailMessage;
  sender?: EmailAddress;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { open, onNewEmail, readOnly } = useMailThreadActions();
  const email = sender?.email;

  const copyAddress = async () => {
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      toast({ title: 'Email address copied' });
    } catch {
      toast({
        title: 'Could not copy email address',
        variant: 'destructive',
      });
    }
  };

  return (
    <ContextMenu>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Content className="w-56">
        <ContextMenu.Label className="truncate text-xs text-muted-foreground">
          {email || sender?.name || 'Unknown sender'}
        </ContextMenu.Label>
        <ContextMenu.Separator />
        <ContextMenu.Item disabled={!email} onSelect={copyAddress}>
          <IconCopy className="size-4" />
          Copy address
        </ContextMenu.Item>
        <ContextMenu.Item
          disabled={!email || !onNewEmail}
          onSelect={() => {
            if (email) onNewEmail?.(email);
          }}
        >
          <IconMailPlus className="size-4" />
          New email
        </ContextMenu.Item>
        {!readOnly && (
          <>
            <ContextMenu.Separator />
            <ContextMenu.Item onSelect={() => open(message, 'reply')}>
              <IconArrowBackUp className="size-4" />
              {t('reply')}
            </ContextMenu.Item>
            <ContextMenu.Item onSelect={() => open(message, 'replyAll')}>
              <IconUsers className="size-4" />
              {t('reply-all')}
            </ContextMenu.Item>
            <ContextMenu.Item onSelect={() => open(message, 'forward')}>
              <IconMailForward className="size-4" />
              {t('forward')}
            </ContextMenu.Item>
          </>
        )}
      </ContextMenu.Content>
    </ContextMenu>
  );
};
