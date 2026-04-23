import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useSubscription } from '@apollo/client';
import {
  ScrollArea,
  Spinner,
  cn,
  formatDateISOStringToRelativeDate,
  toast,
} from 'erxes-ui';
import {
  IconArrowBackUp,

  IconChevronDown,
  IconChevronUp,
  IconMailForward,
  IconPaperclip,
  IconSend,
  IconUsers,
  IconX,
} from '@tabler/icons-react';

import {
  IMAP_CONVERSATION_DETAIL_QUERY,
  IMAP_MESSAGE_INSERTED_SUBSCRIPTION,
} from '../graphql/queries/imapQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useSetAtom } from 'jotai';
import { hideMessageInputState } from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { useImapSendMail } from '../hooks/useImapConversationDetail';

/* ── Types ──────────────────────────────────────────────────────────── */

interface EmailAddress { name?: string; email?: string }
interface Attachment   { filename?: string; mimeType?: string; size?: number }

interface MailData {
  messageId?: string;
  type?: 'INBOX' | 'SENT';
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  body?: string;
  attachments?: Attachment[];
}

interface ImapMessage { _id: string; createdAt: string; mailData: MailData }

interface ImapConversationDetailResponse {
  imapConversationDetail: ImapMessage[];
}

type ComposeMode = 'reply' | 'replyAll' | 'forward';

/* ── Helpers ────────────────────────────────────────────────────────── */

const fmt = (emails?: EmailAddress[]) =>
  (emails ?? []).map((e) => e.name || e.email || '').filter(Boolean).join(', ');

const initial = (name?: string, email?: string) =>
  (name || email || '?')[0].toUpperCase();

const fmtSize = (b?: number) => {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
};

const stripPrefix = (s: string) => s.replace(/^((re|fwd?):\s*)+/gi, '').trim();

/** 8 Gmail-style avatar background colors, picked by name hash. */
const AVATAR_BG = [
  '#1a73e8', '#e52592', '#188038', '#f29900',
  '#9334e6', '#d93025', '#0097a7', '#795548',
];
const avatarBg = (name?: string, email?: string) => {
  const s = name || email || '?';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0xffffffff;
  return AVATAR_BG[Math.abs(h) % AVATAR_BG.length];
};

const buildQuote = (msg: ImapMessage) =>
  `<br/><br/>` +
  `<blockquote style="border-left:3px solid #1a73e8;margin:0;padding-left:12px;color:#5f6368">` +
  `<p style="margin:0 0 4px;font-size:12px"><b>On ${new Date(msg.createdAt).toLocaleString()}, ${fmt(msg.mailData.from) || 'Unknown'} wrote:</b></p>` +
  (msg.mailData.body ?? '') +
  `</blockquote>`;

const wrapHtml = (body: string) =>
  `<!DOCTYPE html><html><head><meta charset="utf-8"/><style>
    html,body{margin:0;padding:4px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6}
    img{max-width:100%}
  </style></head><body>${body}</body></html>`;

const deriveFrom = (msgs: ImapMessage[]) => {
  for (const m of msgs) {
    if (m.mailData.type === 'INBOX' && m.mailData.to?.[0]?.email) return m.mailData.to[0].email;
    if (m.mailData.type === 'SENT'  && m.mailData.from?.[0]?.email) return m.mailData.from[0].email;
  }
  return '';
};

/* ── EmailBody iframe ───────────────────────────────────────────────── */

const EmailBody: React.FC<{ body?: string }> = ({ body }) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState(80);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onLoad = () => {
      const doc = el.contentDocument;
      if (doc?.body) setH(Math.max(doc.body.scrollHeight + 8, 40));
    };
    el.addEventListener('load', onLoad);
    return () => el.removeEventListener('load', onLoad);
  }, [body]);

  if (!body) return <p className="py-3 text-sm text-[#5f6368] italic">No content</p>;

  return (
    <iframe
      ref={ref}
      srcDoc={wrapHtml(body)}
      style={{ height: h }}
      className="w-full border-0"
      sandbox="allow-same-origin"
      title="Email body"
    />
  );
};

/* ── EmailRow ───────────────────────────────────────────────────────── */

const EmailRow: React.FC<{
  message: ImapMessage;
  defaultExpanded?: boolean;
  isLast?: boolean;
  onReply: () => void;
  onReplyAll: () => void;
  onForward: () => void;
}> = ({ message, defaultExpanded = false, isLast, onReply, onReplyAll, onForward }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { mailData, createdAt } = message;
  const isSent = mailData.type === 'SENT';
  const sender = isSent ? mailData.to?.[0] : mailData.from?.[0];
  const multiRecipient = (mailData.to?.length ?? 0) + (mailData.cc?.length ?? 0) > 1;
  const bg = avatarBg(sender?.name, sender?.email);

  const actionBtn =
    'flex items-center gap-1.5 text-[12px] font-medium ' +
    'text-[#3c4043] dark:text-[#e8eaed] ' +
    'border border-[rgba(0,0,0,0.15)] dark:border-[rgba(255,255,255,0.15)] ' +
    'rounded-full px-3 py-1 ' +
    'hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors';

  return (
    <div
      className={cn(
        !isLast && 'border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]',
      )}
    >
      {/* header / collapsed row */}
      <button
        className="w-full text-left px-4 py-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {/* avatar */}
          <div
            className="w-9 h-9 rounded-full flex-none flex items-center justify-center text-[14px] font-bold text-white select-none"
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
                  <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] whitespace-nowrap flex-none">
                    {formatDateISOStringToRelativeDate(createdAt)}
                  </span>
                </div>
                <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] space-y-px">
                  {!isSent && mailData.from?.length ? <p>from: {fmt(mailData.from)}</p> : null}
                  {mailData.to?.length   ? <p>to: {fmt(mailData.to)}</p>   : null}
                  {mailData.cc?.length   ? <p>cc: {fmt(mailData.cc)}</p>   : null}
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
                      ? mailData.body.replace(/<[^>]+>/g, '').slice(0, 80)
                      : mailData.subject}
                  </span>
                </div>
                <span className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] whitespace-nowrap flex-none">
                  {formatDateISOStringToRelativeDate(createdAt)}
                </span>
              </div>
            )}
          </div>

          <span className="flex-none text-[#5f6368] dark:text-[#9aa0a6]">
            {expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </span>
        </div>
      </button>

      {/* expanded content */}
      {expanded && (
        <div className="px-4 pb-2 ml-12">
          <EmailBody body={mailData.body} />

          {/* attachments */}
          {!!mailData.attachments?.length && (
            <div className="flex flex-wrap gap-2 py-3 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] mt-1">
              {mailData.attachments.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.1)] px-3 py-2 text-[12px] text-[#3c4043] dark:text-[#e8eaed] hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                >
                  <IconPaperclip size={13} className="text-[#5f6368] flex-none" />
                  <span className="max-w-[160px] truncate">{a.filename || 'attachment'}</span>
                  {!!a.size && <span className="text-[#5f6368]">{fmtSize(a.size)}</span>}
                </div>
              ))}
            </div>
          )}

          {/* action buttons */}
          <div className="flex gap-2 pt-3 mt-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
            <button className={actionBtn} onClick={onReply}>
              <IconArrowBackUp size={13} /> Reply
            </button>
            {multiRecipient && (
              <button className={actionBtn} onClick={onReplyAll}>
                <IconUsers size={13} /> Reply all
              </button>
            )}
            <button className={actionBtn} onClick={onForward}>
              <IconMailForward size={13} /> Forward
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── ComposeSection ─────────────────────────────────────────────────── */

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

const ComposeSection: React.FC<ComposeProps> = (p) => {
  const [to,  setTo]  = useState(p.defaultTo.join(', '));
  const [cc,  setCc]  = useState(p.defaultCc?.join(', ') ?? '');
  const [bcc, setBcc] = useState('');
  const [subject, setSub] = useState(() => {
    const base = stripPrefix(p.defaultSubject);
    return p.mode === 'forward' ? `Fwd: ${base}` : `Re: ${base}`;
  });
  const [showCc,  setShowCc]  = useState(Boolean(p.defaultCc?.length));
  const [showBcc, setShowBcc] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const { imapSendMail, loading } = useImapSendMail();

  useEffect(() => { bodyRef.current?.focus(); }, []);
  useEffect(() => {
    if (bodyRef.current && p.defaultBody) bodyRef.current.innerHTML = p.defaultBody;
  }, [p.defaultBody]);

  const split = (v: string) => v.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);

  const send = () => {
    const toList = split(to);
    if (!toList.length)
      return toast({ title: 'Enter at least one recipient', variant: 'destructive' });
    const body = bodyRef.current?.innerHTML ?? '';
    if (!body.trim() || body === '<br>')
      return toast({ title: 'Message body cannot be empty', variant: 'destructive' });

    imapSendMail({
      integrationId: p.integrationId,
      conversationId: p.conversationId,
      subject,
      body,
      to: toList,
      cc:  showCc  && cc  ? split(cc)  : undefined,
      bcc: showBcc && bcc ? split(bcc) : undefined,
      from: p.defaultFrom,
      replyToMessageId: p.mode !== 'forward' ? p.replyToMessageId : undefined,
      references:       p.mode !== 'forward' ? p.references       : undefined,
    }, p.onClose);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); send(); }
  };

  const row   = 'flex items-center gap-2 px-4 h-9 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] text-[13px]';
  const lbl   = 'w-14 flex-none text-[11px] text-[#5f6368] dark:text-[#9aa0a6] select-none';
  const inp   = 'flex-1 bg-transparent outline-none text-[13px] text-foreground placeholder:text-[#9aa0a6]';

  return (
    <div
      className="mx-4 mb-3 border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.1)] rounded-2xl overflow-hidden bg-background shadow-[0_1px_3px_rgba(0,0,0,0.18),0_4px_8px_rgba(0,0,0,0.08)]"
      onKeyDown={onKey}
    >
      {/* top bar */}
      <div className="flex items-center justify-between px-4 h-10 border-b border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)] bg-[rgba(0,0,0,0.02)] dark:bg-[rgba(255,255,255,0.02)]">
        <span className="text-[13px] font-medium text-foreground/70">
          {p.mode === 'forward' ? 'Forward' : p.mode === 'replyAll' ? 'Reply all' : 'Reply'}
        </span>
        <button
          className="p-1 rounded text-[#5f6368] hover:text-foreground hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          onClick={p.onClose}
          aria-label="Discard"
        >
          <IconX size={14} />
        </button>
      </div>

      {/* address rows */}
      <div className={row}>
        <span className={lbl}>From</span>
        <span className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] truncate">{p.defaultFrom}</span>
      </div>
      <div className={row}>
        <span className={lbl}>To</span>
        <input
          className={inp}
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder={p.mode === 'forward' ? 'Recipients' : ''}
          autoFocus={p.mode === 'forward'}
        />
        <div className="flex gap-3 flex-none text-[11px] text-[#5f6368]">
          {!showCc  && <button className="hover:text-foreground transition-colors" onClick={() => setShowCc(true)}>Cc</button>}
          {!showBcc && <button className="hover:text-foreground transition-colors" onClick={() => setShowBcc(true)}>Bcc</button>}
        </div>
      </div>
      {showCc && (
        <div className={row}>
          <span className={lbl}>Cc</span>
          <input className={inp} value={cc} onChange={(e) => setCc(e.target.value)} placeholder="cc@example.com" />
          <button className="flex-none text-[#5f6368] hover:text-foreground" onClick={() => { setShowCc(false); setCc(''); }}>
            <IconX size={12} />
          </button>
        </div>
      )}
      {showBcc && (
        <div className={row}>
          <span className={lbl}>Bcc</span>
          <input className={inp} value={bcc} onChange={(e) => setBcc(e.target.value)} placeholder="bcc@example.com" />
          <button className="flex-none text-[#5f6368] hover:text-foreground" onClick={() => { setShowBcc(false); setBcc(''); }}>
            <IconX size={12} />
          </button>
        </div>
      )}
      <div className={row}>
        <span className={lbl}>Subject</span>
        <input className={inp} value={subject} onChange={(e) => setSub(e.target.value)} />
      </div>

      {/* body */}
      <div
        ref={bodyRef}
        className="min-h-[120px] max-h-[260px] overflow-y-auto px-4 py-3 text-[14px] leading-relaxed focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-[#9aa0a6]"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Email body"
        data-placeholder="Write your message…"
      />

      {/* footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[rgba(0,0,0,0.08)] dark:border-[rgba(255,255,255,0.06)]">
        <span className="text-[11px] text-[#9aa0a6] select-none">
          {typeof navigator !== 'undefined' && /Mac/.test(navigator.platform) ? '⌘' : 'Ctrl'}+Enter to send
        </span>
        <div className="flex items-center gap-2">
          <button
            className="text-[12px] text-[#5f6368] hover:text-foreground px-2 py-1 rounded transition-colors"
            onClick={p.onClose}
            disabled={loading}
          >
            Discard
          </button>
          <button
            className={cn(
              'flex items-center gap-1.5 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors',
              loading
                ? 'bg-[#1a73e8]/50 text-white/60 cursor-not-allowed'
                : 'bg-[#1a73e8] text-white hover:bg-[#1557b0]',
            )}
            onClick={send}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" /> : <IconSend size={13} />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main ───────────────────────────────────────────────────────────── */

export const ImapConversationDetail: React.FC = () => {
  const { _id: conversationId, integration } = useConversationContext();
  const setHideInput = useSetAtom(hideMessageInputState);

  const [composeMode,   setComposeMode]   = useState<ComposeMode | null>(null);
  const [composeTarget, setComposeTarget] = useState<ImapMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHideInput(true);
    return () => setHideInput(false);
  }, []);

  const { data, loading, error, refetch } = useQuery<ImapConversationDetailResponse>(
    IMAP_CONVERSATION_DETAIL_QUERY,
    { variables: { conversationId }, skip: !conversationId, fetchPolicy: 'cache-and-network' },
  );

  useSubscription(IMAP_MESSAGE_INSERTED_SUBSCRIPTION, {
    variables: { _id: conversationId },
    skip: !conversationId,
    onData: () => refetch(),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.imapConversationDetail?.length]);

  if (loading) return (
    <div className="flex h-40 items-center justify-center">
      <Spinner />
    </div>
  );

  if (error) return (
    <div className="flex h-40 items-center justify-center text-sm text-destructive/80">
      Failed to load emails: {error.message}
    </div>
  );

  const messages = data?.imapConversationDetail ?? [];

  if (!messages.length) return (
    <div className="flex flex-col h-40 items-center justify-center gap-2 text-[#5f6368]">
      <IconMailForward size={32} strokeWidth={1.2} />
      <span className="text-[13px]">No emails in this conversation</span>
    </div>
  );

  const fromEmail   = deriveFrom(messages);
  const lastMsg     = messages[messages.length - 1];
  const subject     = messages[0]?.mailData.subject ?? '';
  const baseSubject = stripPrefix(subject);

  const open = (msg: ImapMessage, mode: ComposeMode) => {
    setComposeTarget(msg);
    setComposeMode(mode);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  };
  const close = () => { setComposeMode(null); setComposeTarget(null); };

  const getTo = (msg: ImapMessage, mode: ComposeMode): string[] => {
    if (mode === 'forward') return [];
    const { type, from, to } = msg.mailData;
    return type === 'SENT'
      ? (to  ?? []).map((e) => e.email ?? '').filter(Boolean)
      : (from ?? []).map((e) => e.email ?? '').filter(Boolean);
  };

  const getCc = (msg: ImapMessage, mode: ComposeMode): string[] => {
    if (mode !== 'replyAll') return [];
    return [
      ...(msg.mailData.to  ?? []).map((e) => e.email ?? ''),
      ...(msg.mailData.cc  ?? []).map((e) => e.email ?? ''),
    ].filter((e) => Boolean(e) && e !== fromEmail);
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 max-w-3xl mx-auto pb-8 space-y-3">

        {/* subject */}
        <h2 className="text-[20px] font-normal text-foreground px-1 truncate">
          {baseSubject || '(No subject)'}
        </h2>

        {/* thread card */}
        <div className="rounded-2xl border border-[rgba(0,0,0,0.12)] dark:border-[rgba(255,255,255,0.1)] bg-background overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_6px_rgba(0,0,0,0.05)]">

          {/* email rows */}
          {messages.map((msg, idx) => (
            <EmailRow
              key={msg._id}
              message={msg}
              defaultExpanded={idx === messages.length - 1}
              isLast={idx === messages.length - 1}
              onReply={()    => open(msg, 'reply')}
              onReplyAll={()  => open(msg, 'replyAll')}
              onForward={()  => open(msg, 'forward')}
            />
          ))}

        </div>

        {composeMode && composeTarget && (
          <ComposeSection
            mode={composeMode}
            defaultTo={getTo(composeTarget, composeMode)}
            defaultCc={getCc(composeTarget, composeMode)}
            defaultFrom={fromEmail}
            defaultSubject={composeTarget.mailData.subject ?? ''}
            defaultBody={composeMode === 'forward' ? buildQuote(composeTarget) : ''}
            conversationId={conversationId ?? ''}
            integrationId={integration?._id ?? ''}
            replyToMessageId={composeTarget.mailData.messageId}
            references={[composeTarget.mailData.messageId ?? '']}
            onClose={close}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
