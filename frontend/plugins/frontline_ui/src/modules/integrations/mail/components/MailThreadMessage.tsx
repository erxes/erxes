import React, { useState } from 'react';
import {
  ContextMenu,
  cn,
  formatDateISOStringToRelativeDate,
  readImage,
  toast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IconArrowBackUp,
  IconChevronDown,
  IconChevronUp,
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
import {
  formatAddresses,
  formatAttachmentSize,
  senderAvatarBg,
  senderInitial,
} from '@/integrations/mail/utils/mailThread';
import { useMailThreadActions } from '@/integrations/mail/hooks/useMailThreadActions';
import { EmailBody } from './EmailBody';
import {
  DeliveryBadge,
  DeliveryNotice,
  SenderNotice,
} from './MailThreadNotices';

const AttachmentChip: React.FC<{ attachment: Attachment }> = ({
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
      {!!attachment.size && (
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

const SenderContextMenu = ({
  message,
  sender,
  children,
}: {
  message: MailMessage;
  sender?: EmailAddress;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation('frontline');
  const { open, onNewEmail } = useMailThreadActions();
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
      </ContextMenu.Content>
    </ContextMenu>
  );
};

export const MailThreadMessage: React.FC<{
  message: MailMessage;
  defaultExpanded?: boolean;
}> = ({ message, defaultExpanded = false }) => {
  const { t } = useTranslation('frontline');
  const { readOnly, open } = useMailThreadActions();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showQuoted, setShowQuoted] = useState(false);
  const { mailData, createdAt } = message;
  const isSent = mailData.type === 'SENT';
  const sender = mailData.from?.[0];
  const multiRecipient =
    (mailData.to?.length ?? 0) + (mailData.cc?.length ?? 0) > 1;
  const bg = senderAvatarBg(sender?.name, sender?.email);
  const delivery = isSent ? mailData.deliveryStatus : undefined;
  const visibleAttachments = (mailData.attachments ?? []).filter(
    (attachment) => attachment.disposition !== 'inline',
  );

  const actionBtn =
    'flex items-center gap-1.5 text-[12px] font-medium ' +
    'text-[#3c4043] dark:text-[#e8eaed] ' +
    'border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] ' +
    'rounded-full px-3 py-1 ' +
    'hover:bg-background/[0.04] transition-colors';

  return (
    <div className="rounded-xl border border-border bg-background">
      <SenderContextMenu message={message} sender={sender}>
        <button
          type="button"
          className="w-full text-left px-4 py-3 hover:bg-background/2 transition-colors"
          onClick={() => setExpanded((v) => !v)}
          title="Right-click for sender actions"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-[14px] font-bold text-foreground select-none"
              style={{ background: bg }}
            >
              {senderInitial(sender?.name, sender?.email)}
            </div>

            <div className="flex-1 min-w-0">
              {expanded ? (
                <div className="space-y-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-foreground truncate">
                      {sender?.name || sender?.email || '—'}
                    </span>
                    <span className="flex flex-none items-center gap-1.5">
                      {delivery && delivery !== 'sent' && (
                        <DeliveryBadge status={delivery} />
                      )}
                      <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] whitespace-nowrap">
                        {formatDateISOStringToRelativeDate(createdAt)}
                      </span>
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] space-y-px">
                    {!isSent && mailData.from?.length ? (
                      <p>from: {formatAddresses(mailData.from)}</p>
                    ) : null}
                    {mailData.to?.length ? (
                      <p>to: {formatAddresses(mailData.to)}</p>
                    ) : null}
                    {mailData.cc?.length ? (
                      <p>cc: {formatAddresses(mailData.cc)}</p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-2 justify-between">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="text-[13px] font-semibold text-foreground whitespace-nowrap">
                      {sender?.name || sender?.email || '—'}
                    </span>
                    <span className="text-[12px] text-[#5f6368] dark:text-[#9aa0a6] truncate">
                      {mailData.body
                        ? mailData.body.replace(/<[^<>]*>/g, '').slice(0, 80)
                        : mailData.subject}
                    </span>
                  </div>
                  <span className="flex flex-none items-center gap-1.5">
                    {delivery && delivery !== 'sent' && (
                      <DeliveryBadge status={delivery} />
                    )}
                    <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] whitespace-nowrap">
                      {formatDateISOStringToRelativeDate(createdAt)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            <span className="flex-none text-[#5f6368] dark:text-[#9aa0a6]">
              {expanded ? (
                <IconChevronUp size={14} />
              ) : (
                <IconChevronDown size={14} />
              )}
            </span>
          </div>
        </button>
      </SenderContextMenu>

      {expanded && (
        <div className="px-4 pb-2 ml-12">
          <SenderNotice mailData={mailData} />

          <EmailBody
            body={mailData.newContent ?? mailData.body}
            attachments={mailData.attachments}
          />

          {mailData.replies && (
            <div className="space-y-1">
              <button
                type="button"
                className="rounded border border-[rgba(0,0,0,0.15)] px-2 py-0.5 text-[11px] leading-none text-[#5f6368] transition-colors hover:bg-background/[0.04] dark:border-[rgba(255,255,255,0.15)] dark:text-[#9aa0a6]"
                onClick={() => setShowQuoted((v) => !v)}
                title={t('toggle-quoted-text')}
                aria-label={t('toggle-quoted-text')}
                aria-expanded={showQuoted}
              >
                •••
              </button>
              {showQuoted && (
                <EmailBody
                  body={mailData.replies}
                  attachments={mailData.attachments}
                />
              )}
            </div>
          )}

          <DeliveryNotice messageId={message._id} mailData={mailData} />

          {!!visibleAttachments.length && (
            <div className="flex flex-wrap gap-2 py-3 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] mt-1">
              {visibleAttachments.map((a, i) => (
                <AttachmentChip
                  key={`${a.url ?? a.filename}-${i}`}
                  attachment={a}
                />
              ))}
            </div>
          )}

          {!readOnly && (
            <div className="flex gap-2 pt-3 mt-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
              <button
                type="button"
                className={actionBtn}
                onClick={() => open(message, 'reply')}
              >
                <IconArrowBackUp size={13} /> {t('reply')}
              </button>
              {multiRecipient && (
                <button
                  type="button"
                  className={actionBtn}
                  onClick={() => open(message, 'replyAll')}
                >
                  <IconUsers size={13} /> {t('reply-all')}
                </button>
              )}
              <button
                type="button"
                className={actionBtn}
                onClick={() => open(message, 'forward')}
              >
                <IconMailForward size={13} /> {t('forward')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
