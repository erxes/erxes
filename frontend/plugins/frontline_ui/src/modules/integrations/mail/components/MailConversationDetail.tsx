import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  ScrollArea,
  Spinner,
  cn,
  formatDateISOStringToRelativeDate,
  readImage,
  toast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IconAlertTriangle,
  IconArrowBackUp,
  IconChevronDown,
  IconChevronUp,
  IconMailForward,
  IconPaperclip,
  IconRefresh,
  IconSend,
  IconUsers,
  IconX,
} from '@tabler/icons-react';

import {
  MAIL_CONVERSATION_DETAIL_QUERY,
  MAIL_MESSAGE_INSERTED_SUBSCRIPTION,
} from '../graphql/queries/mailQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useSetAtom } from 'jotai';
import { hideMessageInputState } from '@/inbox/conversations/conversation-detail/states/isInternalState';
import {
  MailDeliveryStatus,
  useMailMessageRetry,
  useMailSendMail,
} from '../hooks/useMailConversationDetail';
import { EmailBody } from './EmailBody';

interface EmailAddress {
  name?: string;
  email?: string;
}
interface Attachment {
  filename?: string;
  mimeType?: string;
  size?: number;
  url?: string;
  contentId?: string;
  disposition?: 'attachment' | 'inline';
  error?: string;
}

interface MailData {
  messageId?: string;
  references?: string[];
  type?: 'INBOX' | 'SENT';
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  body?: string;
  newContent?: string;
  replies?: string;
  attachments?: Attachment[];
  deliveryStatus?: MailDeliveryStatus;
  deliveryError?: string;
  deliveryRetryable?: boolean;
  bouncedRecipients?: string[];
  envelopeFrom?: string;
  senderMismatch?: boolean;
}

interface MailMessage {
  _id: string;
  createdAt: string;
  mailData: MailData;
}

interface MailConversationDetailResponse {
  mailConversationDetail: {
    messages: MailMessage[];
    hasMore: boolean;
  } | null;
}

const PAGE_SIZE = 20;

type ComposeMode = 'reply' | 'replyAll' | 'forward';

const COMPOSE_TITLE_KEYS: Record<ComposeMode, string> = {
  reply: 'reply',
  replyAll: 'reply-all',
  forward: 'forward',
};

const fmt = (emails?: EmailAddress[]) =>
  (emails ?? [])
    .map((e) => e.name || e.email || '')
    .filter(Boolean)
    .join(', ');

const initial = (name?: string, email?: string) =>
  (name || email || '?')[0].toUpperCase();

const fmtSize = (b?: number) => {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const stripPrefix = (s: string) => s.replace(/^((re|fwd?):\s*)+/gi, '').trim();

const AVATAR_BG = [
  '#1a73e8',
  '#e52592',
  '#188038',
  '#f29900',
  '#9334e6',
  '#d93025',
  '#0097a7',
  '#795548',
];
const avatarBg = (name?: string, email?: string) => {
  const s = name || email || '?';
  let h = 0;
  for (let i = 0; i < s.length; i++)
    h = (h * 31 + (s.codePointAt(i) ?? 0)) & 0xffffffff;
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
};

const buildQuote = (msg: MailMessage) =>
  `<br/><br/>` +
  `<blockquote style="border-left:3px solid #1a73e8;margin:0;padding-left:12px;color:#5f6368">` +
  `<p style="margin:0 0 4px;font-size:12px"><b>On ${new Date(
    msg.createdAt,
  ).toLocaleString()}, ${fmt(msg.mailData.from) || 'Unknown'} wrote:</b></p>` +
  (msg.mailData.body ?? '') +
  `</blockquote>`;

const deriveFrom = (msgs: MailMessage[]) => {
  for (const m of msgs) {
    if (m.mailData.type === 'INBOX' && m.mailData.to?.[0]?.email)
      return m.mailData.to[0].email;
    if (m.mailData.type === 'SENT' && m.mailData.from?.[0]?.email)
      return m.mailData.from[0].email;
  }
  return '';
};

const DELIVERY_LABEL_KEYS: Partial<Record<MailDeliveryStatus, string>> = {
  pending: 'email-delivery-pending',
  bounced: 'email-delivery-bounced',
};

const DeliveryBadge: React.FC<{ status: MailDeliveryStatus }> = ({
  status,
}) => {
  const { t } = useTranslation('frontline');

  const label = t(DELIVERY_LABEL_KEYS[status] ?? 'email-delivery-failed');

  return (
    <span
      className={cn(
        'flex-none rounded-full px-2 py-px text-[10px] font-medium',
        status === 'pending'
          ? 'bg-muted text-[#5f6368] dark:text-[#9aa0a6]'
          : 'bg-destructive/10 text-destructive',
      )}
    >
      {label}
    </span>
  );
};

const DeliveryNotice: React.FC<{ messageId: string; mailData: MailData }> = ({
  messageId,
  mailData,
}) => {
  const { t } = useTranslation('frontline');
  const { mailMessageRetry, loading } = useMailMessageRetry();
  const { deliveryStatus } = mailData;

  if (deliveryStatus !== 'failed' && deliveryStatus !== 'bounced') {
    return null;
  }

  const bounced = deliveryStatus === 'bounced';

  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-[12px]">
      <IconAlertTriangle
        size={14}
        className="mt-0.5 flex-none text-destructive"
      />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium text-destructive">
          {bounced ? t('email-delivery-bounced') : t('email-delivery-failed')}
        </p>
        <p className="break-words text-[#5f6368] dark:text-[#9aa0a6]">
          {bounced
            ? t('email-bounced-for', {
                recipients: (mailData.bouncedRecipients ?? []).join(', '),
              })
            : mailData.deliveryError}
        </p>
        {!bounced && (
          <p className="text-[#5f6368] dark:text-[#9aa0a6]">
            {mailData.deliveryRetryable
              ? t('email-delivery-retry-hint')
              : t('email-delivery-permanent-hint')}
          </p>
        )}
      </div>
      {!bounced && (
        <button
          type="button"
          className="flex flex-none items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1 text-[12px] font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-60"
          onClick={() => mailMessageRetry(messageId)}
          disabled={loading}
        >
          {loading ? <Spinner size="sm" /> : <IconRefresh size={13} />}
          {t('email-delivery-retry')}
        </button>
      )}
    </div>
  );
};

const SenderNotice: React.FC<{ mailData: MailData }> = ({ mailData }) => {
  const { t } = useTranslation('frontline');

  if (!mailData.senderMismatch) {
    return null;
  }

  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/5 px-3 py-2 text-[12px]">
      <IconAlertTriangle size={14} className="mt-0.5 flex-none text-warning" />
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium text-warning">
          {t('email-sender-unverified')}
        </p>
        <p className="break-words text-[#5f6368] dark:text-[#9aa0a6]">
          {t('email-sender-mismatch', { address: mailData.envelopeFrom })}
        </p>
      </div>
    </div>
  );
};

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
        <span className="text-[#5f6368]">{fmtSize(attachment.size)}</span>
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

const EmailRow: React.FC<{
  message: MailMessage;
  defaultExpanded?: boolean;
  isLast?: boolean;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
}> = ({
  message,
  defaultExpanded = false,
  isLast,
  onReply,
  onReplyAll,
  onForward,
}) => {
  const { t } = useTranslation('frontline');
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showQuoted, setShowQuoted] = useState(false);
  const { mailData, createdAt } = message;
  const isSent = mailData.type === 'SENT';
  const sender = mailData.from?.[0];
  const multiRecipient =
    (mailData.to?.length ?? 0) + (mailData.cc?.length ?? 0) > 1;
  const bg = avatarBg(sender?.name, sender?.email);
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
    <div
      className={cn(
        !isLast &&
          'border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]',
      )}
    >
      <button
        type="button"
        className="w-full text-left px-4 py-3 hover:bg-background/2 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-[14px] font-bold text-foreground select-none"
            style={{ background: bg }}
          >
            {initial(sender?.name, sender?.email)}
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
                    <p>from: {fmt(mailData.from)}</p>
                  ) : null}
                  {mailData.to?.length ? <p>to: {fmt(mailData.to)}</p> : null}
                  {mailData.cc?.length ? <p>cc: {fmt(mailData.cc)}</p> : null}
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
                <AttachmentChip key={`${a.url ?? a.filename}-${i}`} attachment={a} />
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-3 mt-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
            <button type="button" className={actionBtn} onClick={onReply}>
              <IconArrowBackUp size={13} /> {t('reply')}
            </button>
            {multiRecipient && (
              <button type="button" className={actionBtn} onClick={onReplyAll}>
                <IconUsers size={13} /> {t('reply-all')}
              </button>
            )}
            <button type="button" className={actionBtn} onClick={onForward}>
              <IconMailForward size={13} /> {t('forward')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ComposeProps {
  mode: ComposeMode;
  defaultTo: string[];
  defaultCc?: string[];
  defaultFrom: string;
  defaultSubject: string;
  defaultBody?: string;
  conversationId: string;
  integrationId: string;
  replyToMessageId?: string;
  references?: string[];
  onClose: () => void;
}

const ComposeSection: React.FC<ComposeProps> = ({
  mode,
  defaultTo,
  defaultCc,
  defaultFrom,
  defaultSubject,
  defaultBody,
  conversationId,
  integrationId,
  replyToMessageId,
  references,
  onClose,
}) => {
  const { t } = useTranslation('frontline');
  const [to, setTo] = useState(defaultTo.join(', '));
  const [cc, setCc] = useState(defaultCc?.join(', ') ?? '');
  const [bcc, setBcc] = useState('');
  const [subject, setSub] = useState(() => {
    const base = stripPrefix(defaultSubject);
    return mode === 'forward' ? `Fwd: ${base}` : `Re: ${base}`;
  });
  const [showCc, setShowCc] = useState(Boolean(defaultCc?.length));
  const [showBcc, setShowBcc] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { mailSendMail, loading } = useMailSendMail();

  useEffect(() => {
    bodyRef.current?.focus();
  }, []);
  useEffect(() => {
    if (bodyRef.current && defaultBody)
      bodyRef.current.innerHTML = defaultBody;
  }, [defaultBody]);

  const split = (v: string) =>
    v
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const send = () => {
    const toList = split(to);
    if (!toList.length)
      return toast({
        title: t('enter-at-least-one-recipient'),
        variant: 'destructive',
      });
    const body = bodyRef.current?.innerHTML ?? '';
    if (!body.trim() || body === '<br>')
      return toast({
        title: t('message-body-cannot-be-empty'),
        variant: 'destructive',
      });

    mailSendMail(
      {
        integrationId: integrationId,
        conversationId: conversationId,
        subject,
        body,
        to: toList,
        cc: showCc && cc ? split(cc) : undefined,
        bcc: showBcc && bcc ? split(bcc) : undefined,
        replyToMessageId: mode !== 'forward' ? replyToMessageId : undefined,
        references: mode !== 'forward' ? references : undefined,
      },
      onClose,
    );
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      send();
    }
  };

  const row =
    'flex items-center gap-2 px-4 h-9 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] text-[13px]';
  const lbl =
    'w-14 flex-none text-[11px] text-[#5f6368] dark:text-[#9aa0a6] select-none';
  const inp =
    'flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-[#9aa0a6]';

  return (
    <div className="mx-4 mb-3 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden bg-background shadow-[0_1px_3px_rgba(0,0,0,0.18),0_4px_8px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-between px-4 h-10 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)]">
        <span className="text-[13px] font-medium text-foreground/70">
          {t(COMPOSE_TITLE_KEYS[mode])}
        </span>
        <button
          type="button"
          className="p-1 rounded text-[#5f6368] hover:text-foreground hover:bg-background/10 transition-colors"
          onClick={onClose}
          aria-label={t('discard')}
        >
          <IconX size={14} />
        </button>
      </div>

      <div className={row}>
        <span className={lbl}>{t('from')}</span>
        <span className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate">
          {defaultFrom}
        </span>
      </div>
      <div className={row}>
        <span className={lbl}>{t('to')}</span>
        <input
          className={inp}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          onKeyDown={onKey}
          placeholder={mode === 'forward' ? t('recipients') : ''}
          autoFocus={mode === 'forward'}
        />
        <div className="flex gap-3 flex-none text-[11px] text-[#5f6368]">
          {!showCc && (
            <button
              type="button"
              className="hover:text-foreground transition-colors"
              onClick={() => setShowCc(true)}
            >
              {t('cc')}
            </button>
          )}
          {!showBcc && (
            <button
              type="button"
              className="hover:text-foreground transition-colors"
              onClick={() => setShowBcc(true)}
            >
              {t('bcc')}
            </button>
          )}
        </div>
      </div>
      {showCc && (
        <div className={row}>
          <span className={lbl}>{t('cc')}</span>
          <input
            className={inp}
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            onKeyDown={onKey}
            placeholder="cc@example.com"
          />
          <button
            type="button"
            className="flex-none text-[#5f6368] hover:text-foreground"
            onClick={() => {
              setShowCc(false);
              setCc('');
            }}
          >
            <IconX size={12} />
          </button>
        </div>
      )}
      {showBcc && (
        <div className={row}>
          <span className={lbl}>{t('bcc')}</span>
          <input
            className={inp}
            value={bcc}
            onChange={(e) => setBcc(e.target.value)}
            onKeyDown={onKey}
            placeholder="bcc@example.com"
          />
          <button
            type="button"
            className="flex-none text-[#5f6368] hover:text-foreground"
            onClick={() => {
              setShowBcc(false);
              setBcc('');
            }}
          >
            <IconX size={12} />
          </button>
        </div>
      )}
      <div className={row}>
        <span className={lbl}>{t('subject')}</span>
        <input
          className={inp}
          value={subject}
          onChange={(e) => setSub(e.target.value)}
          onKeyDown={onKey}
        />
      </div>

      <div
        ref={bodyRef}
        className="min-h-[120px] max-h-[260px] overflow-y-auto px-4 py-3 text-[14px] leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#9aa0a6]"
        contentEditable
        suppressContentEditableWarning
        onKeyDown={onKey}
        tabIndex={0}
        role="textbox"
        aria-multiline="true"
        aria-label={t('email-body')}
        data-placeholder={t('write-your-message')}
      />

      <div className="flex items-center justify-between px-4 py-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
        <span className="text-[11px] text-[#9aa0a6] select-none">
          {typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
            ? '⌘'
            : 'Ctrl'}
          +{t('enter-to-send')}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="text-[12px] text-[#5f6368] hover:text-foreground px-2 py-1 rounded transition-colors"
            onClick={onClose}
            disabled={loading}
          >
            {t('discard')}
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors',
              loading
                ? 'bg-info/50 text-foreground/60 cursor-not-allowed'
                : 'bg-info text-foreground hover:bg-info/20',
            )}
            onClick={send}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : <IconSend size={13} />}
            {t('send')}
          </button>
        </div>
      </div>
    </div>
  );
};

export const MailConversationDetail: React.FC = () => {
  const { t } = useTranslation('frontline');
  const { _id: conversationId, integration } = useConversationContext();
  const setHideInput = useSetAtom(hideMessageInputState);

  const [composeMode, setComposeMode] = useState<ComposeMode | null>(null);
  const [composeTarget, setComposeTarget] = useState<MailMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHideInput(true);
    return () => setHideInput(false);
  }, [setHideInput]);

  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, previousData, loading, error, refetch } =
    useQuery<MailConversationDetailResponse>(MAIL_CONVERSATION_DETAIL_QUERY, {
      variables: { conversationId, limit },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
    });

  useSubscription(MAIL_MESSAGE_INSERTED_SUBSCRIPTION, {
    variables: { _id: conversationId },
    skip: !conversationId,
    onData: () => refetch(),
  });

  const detail =
    data?.mailConversationDetail ?? previousData?.mailConversationDetail;
  const messages = detail?.messages ?? [];
  const newestId = messages[messages.length - 1]?._id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newestId]);

  if (loading && !detail)
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );

  if (error)
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive/80">
        {t('failed-to-load-emails', { message: error.message })}
      </div>
    );

  if (!messages.length)
    return (
      <div className="flex flex-col h-40 items-center justify-center gap-2 text-[#5f6368]">
        <IconMailForward size={32} strokeWidth={1.2} />
        <span className="text-[13px]">{t('no-emails-in-conversation')}</span>
      </div>
    );

  const fromEmail = deriveFrom(messages);
  const subject = messages[0]?.mailData.subject ?? '';
  const baseSubject = stripPrefix(subject);

  const open = (msg: MailMessage, mode: ComposeMode) => {
    setComposeTarget(msg);
    setComposeMode(mode);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      60,
    );
  };
  const close = () => {
    setComposeMode(null);
    setComposeTarget(null);
  };

  const getTo = (msg: MailMessage, mode: ComposeMode): string[] => {
    if (mode === 'forward') return [];
    const { type, from, to } = msg.mailData;
    return type === 'SENT'
      ? (to ?? []).map((e) => e.email ?? '').filter(Boolean)
      : (from ?? []).map((e) => e.email ?? '').filter(Boolean);
  };

  const getCc = (msg: MailMessage, mode: ComposeMode): string[] => {
    if (mode !== 'replyAll') return [];
    return [
      ...(msg.mailData.to ?? []).map((e) => e.email ?? ''),
      ...(msg.mailData.cc ?? []).map((e) => e.email ?? ''),
    ].filter((e) => Boolean(e) && e !== fromEmail);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 max-w-3xl mx-auto pb-8 space-y-3">
        <h2 className="text-[20px] font-normal text-foreground px-1 truncate">
          {baseSubject || '(No subject)'}
        </h2>

        {detail?.hasMore && (
          <div className="flex justify-center">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.15)] px-3 py-1 text-[12px] font-medium text-[#3c4043] transition-colors hover:bg-background/[0.04] disabled:opacity-60 dark:border-[rgba(255,255,255,0.15)] dark:text-[#e8eaed]"
              onClick={() => setLimit((value) => value + PAGE_SIZE)}
              disabled={loading}
            >
              {loading && <Spinner size="sm" />}
              {t('show-earlier-messages')}
            </button>
          </div>
        )}

        <div className="rounded-2xl border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-background overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)]">
          {messages.map((msg, idx) => (
            <EmailRow
              key={msg._id}
              message={msg}
              defaultExpanded={idx === messages.length - 1}
              isLast={idx === messages.length - 1}
              onReply={() => open(msg, 'reply')}
              onReplyAll={() => open(msg, 'replyAll')}
              onForward={() => open(msg, 'forward')}
            />
          ))}
        </div>


        {composeMode && composeTarget && (
          <ComposeSection
            key={`${composeMode}-${composeTarget._id}`}
            mode={composeMode}
            defaultTo={getTo(composeTarget, composeMode)}
            defaultCc={getCc(composeTarget, composeMode)}
            defaultFrom={fromEmail}
            defaultSubject={composeTarget.mailData.subject ?? ''}
            defaultBody={
              composeMode === 'forward' ? buildQuote(composeTarget) : ''
            }
            conversationId={conversationId ?? ''}
            integrationId={integration?._id ?? ''}
            replyToMessageId={composeTarget.mailData.messageId}
            references={composeTarget.mailData.references ?? []}
            onClose={close}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
