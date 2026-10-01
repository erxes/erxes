import React, { useState } from 'react';
import { formatDateISOStringToRelativeDate } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IconArrowBackUp,
  IconChevronDown,
  IconChevronUp,
  IconMailForward,
  IconUsers,
} from '@tabler/icons-react';
import type {
  MailData,
  MailMessage,
  MailReaction,
} from '@/integrations/mail/types/mailThread';
import {
  formatAddresses,
  mailMessagePreview,
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
import { AttachmentChip, SenderContextMenu } from './MailMessageActions';
import { MailReactionMenu } from './MailReactionMenu';

const MailMessageAddresses = ({ mailData }: { mailData: MailData }) => {
  const isSent = mailData.type === 'SENT';
  return (
    <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] space-y-px">
      {!isSent && mailData.from?.length ? (
        <p>from: {formatAddresses(mailData.from)}</p>
      ) : null}
      {mailData.to?.length ? <p>to: {formatAddresses(mailData.to)}</p> : null}
      {mailData.cc?.length ? <p>cc: {formatAddresses(mailData.cc)}</p> : null}
    </div>
  );
};

const MailMessageSenderDetails = ({
  message,
  expanded,
}: {
  message: MailMessage;
  expanded: boolean;
}) => {
  const { mailData, createdAt } = message;
  const isSent = mailData.type === 'SENT';
  const sender = mailData.from?.[0];
  const delivery = isSent ? mailData.deliveryStatus : undefined;
  const preview = expanded ? '' : mailMessagePreview(message);
  const label = sender?.name || sender?.email || '—';
  return expanded ? (
    <div className="space-y-0.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-foreground truncate">
          {label}
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
      <MailMessageAddresses mailData={mailData} />
    </div>
  ) : (
    <div className="min-w-0 space-y-1">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-[13px] font-semibold text-foreground">
          {label}
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {delivery && delivery !== 'sent' && (
            <DeliveryBadge status={delivery} />
          )}
          <span className="whitespace-nowrap text-[11px] text-muted-foreground">
            {formatDateISOStringToRelativeDate(createdAt)}
          </span>
        </span>
      </div>
      <p className="truncate text-[12px] text-muted-foreground">
        {preview || mailData.subject || '—'}
      </p>
    </div>
  );
};

const MailMessageHeader = ({
  message,
  expanded,
  onToggle,
}: {
  message: MailMessage;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const { mailData } = message;
  const isSent = mailData.type === 'SENT';
  const sender = mailData.from?.[0];
  const bg = senderAvatarBg(sender?.name, sender?.email);
  const headerContent = (
    <div className="flex items-center gap-3">
      <div
        className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-[14px] font-bold text-foreground select-none"
        style={{ background: bg }}
      >
        {senderInitial(sender?.name, sender?.email)}
      </div>

      <div className="flex-1 min-w-0">
        <MailMessageSenderDetails message={message} expanded={expanded} />
      </div>

      <span className="flex-none text-[#5f6368] dark:text-[#9aa0a6]">
        {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
      </span>
    </div>
  );

  return (
    <SenderContextMenu
      message={message}
      sender={isSent ? mailData.to?.[0] : sender}
    >
      <button
        type="button"
        className="w-full text-left px-4 py-3 hover:bg-background/2 transition-colors"
        onClick={onToggle}
        title="Right-click for sender actions"
      >
        {headerContent}
      </button>
    </SenderContextMenu>
  );
};

const MailMessageReactionChips = ({
  reactions,
}: {
  reactions: MailReaction[];
}) => {
  return (
    reactions.length > 0 && (
      <div className="flex flex-wrap gap-1.5 py-2">
        {[...new Set(reactions.map(({ emoji }) => emoji))].map((emoji) => {
          const matching = reactions.filter(
            (reaction) => reaction.emoji === emoji,
          );
          return (
            <span
              key={emoji}
              title={matching.map(({ sender }) => sender).join(', ')}
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-sm text-foreground"
            >
              <span>{emoji}</span>
              <span>{matching.length}</span>
            </span>
          );
        })}
      </div>
    )
  );
};

const MailMessageReplyActions = ({
  message,
  conversationId,
}: {
  message: MailMessage;
  conversationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { readOnly, open } = useMailThreadActions();
  const multiRecipient =
    (message.mailData.to?.length ?? 0) + (message.mailData.cc?.length ?? 0) > 1;
  if (readOnly) return null;
  const actionBtn =
    'flex items-center gap-1.5 text-[12px] font-medium ' +
    'text-[#3c4043] dark:text-[#e8eaed] ' +
    'border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] ' +
    'rounded-full px-3 py-1 ' +
    'hover:bg-background/[0.04] transition-colors';
  return (
    <div className="flex flex-wrap gap-2 pt-3 mt-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
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
      <MailReactionMenu conversationId={conversationId} message={message} />
    </div>
  );
};

const MailMessageContent = ({
  message,
  conversationId,
  reactions,
  showQuoted,
  onToggleQuoted,
}: {
  message: MailMessage;
  conversationId: string;
  reactions: MailReaction[];
  showQuoted: boolean;
  onToggleQuoted: () => void;
}) => {
  const { t } = useTranslation('frontline');
  const { mailData } = message;
  const visibleAttachments = (mailData.attachments ?? []).filter(
    (attachment) => attachment.disposition !== 'inline',
  );
  return (
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
            onClick={onToggleQuoted}
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

      {Boolean(visibleAttachments.length) && (
        <div className="flex flex-wrap gap-2 py-3 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] mt-1">
          {visibleAttachments.map((attachment) => (
            <AttachmentChip
              key={JSON.stringify([
                attachment.contentId,
                attachment.url,
                attachment.filename,
                attachment.mimeType,
                attachment.size,
              ])}
              attachment={attachment}
            />
          ))}
        </div>
      )}

      <MailMessageReactionChips reactions={reactions} />
      <MailMessageReplyActions
        message={message}
        conversationId={conversationId}
      />
    </div>
  );
};

export const MailThreadMessage: React.FC<{
  message: MailMessage;
  conversationId: string;
  reactions?: MailReaction[];
  defaultExpanded?: boolean;
}> = ({ message, conversationId, reactions = [], defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showQuoted, setShowQuoted] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-background">
      <MailMessageHeader
        message={message}
        expanded={expanded}
        onToggle={() => setExpanded((value) => !value)}
      />
      {expanded && (
        <MailMessageContent
          message={message}
          conversationId={conversationId}
          reactions={reactions}
          showQuoted={showQuoted}
          onToggleQuoted={() => setShowQuoted((value) => !value)}
        />
      )}
    </div>
  );
};
