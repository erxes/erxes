import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import {
  Avatar,
  Button,
  formatDateISOStringToRelativeDate,
  ScrollArea,
  Separator,
  Spinner,
  cn,
  toast,
} from 'erxes-ui';
import {
  IconArrowBackUp,
  IconChevronDown,
  IconChevronUp,
  IconMailForward,
  IconSend,
} from '@tabler/icons-react';

import { IMAP_CONVERSATION_DETAIL_QUERY } from '../graphql/queries/imapQueries';
import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useSetAtom } from 'jotai';
import {
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { useImapSendMail } from '../hooks/useImapConversationDetail';

/* =====================
   Types
===================== */

interface EmailAddress {
  name?: string;
  email?: string;
}

interface MailData {
  messageId?: string;
  type?: 'INBOX' | 'SENT';
  from?: EmailAddress[];
  to?: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject?: string;
  body?: string;
  attachments?: { filename?: string; mimeType?: string; size?: number }[];
}

interface ImapMessage {
  _id: string;
  createdAt: string;
  mailData: MailData;
}

interface ImapConversationDetailResponse {
  imapConversationDetail: ImapMessage[];
}

/* =====================
   Utils
===================== */

const formatEmails = (emails?: EmailAddress[]) =>
  (emails || [])
    .map((e) => e.name || e.email || '')
    .filter(Boolean)
    .join(', ');

const getInitials = (name?: string, email?: string) =>
  (name || email || '?')[0].toUpperCase();

/** Derive the integration's own email from a message list.
 *  INBOX messages: integration email is in `to[0]`
 *  SENT messages: integration email is in `from[0]`
 */
const deriveFromEmail = (messages: ImapMessage[]): string => {
  for (const msg of messages) {
    const { type, to, from } = msg.mailData;
    if (type === 'INBOX' && to?.[0]?.email) return to[0].email;
    if (type === 'SENT' && from?.[0]?.email) return from[0].email;
  }
  return '';
};

/* =====================
   Sub-components
===================== */

const EmailHeader: React.FC<{
  mailData: MailData;
  createdAt: string;
  isSent: boolean;
}> = ({ mailData, createdAt, isSent }) => {
  const sender = isSent ? mailData.to?.[0] : mailData.from?.[0];
  const senderLabel = isSent ? 'To' : 'From';

  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <Avatar size="lg" className="flex-none mt-0.5">
        <Avatar.Fallback
          className={cn(isSent ? 'bg-blue-100 text-blue-600' : 'bg-muted')}
        >
          {getInitials(sender?.name, sender?.email)}
        </Avatar.Fallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-semibold text-sm truncate">
            {sender?.name || sender?.email || '—'}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-none">
            {formatDateISOStringToRelativeDate(createdAt)}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-1 text-xs text-muted-foreground mt-0.5">
          <span>{senderLabel}:</span>
          <span className="truncate">
            {isSent ? formatEmails(mailData.to) : formatEmails(mailData.from)}
          </span>
          {mailData.cc && mailData.cc.length > 0 && (
            <>
              <span className="mx-1">·</span>
              <span>Cc: {formatEmails(mailData.cc)}</span>
            </>
          )}
        </div>
        {mailData.subject && (
          <p className="text-xs text-muted-foreground mt-0.5 font-medium truncate">
            {mailData.subject}
          </p>
        )}
      </div>
    </div>
  );
};

const EmailBody: React.FC<{ body?: string }> = ({ body }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(200);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const onLoad = () => {
      const doc = iframe.contentDocument;
      if (doc?.body) setHeight(doc.body.scrollHeight + 24);
    };
    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [body]);

  if (!body)
    return (
      <p className="px-4 pb-3 text-sm text-muted-foreground italic">
        No content
      </p>
    );

  return (
    <iframe
      ref={iframeRef}
      srcDoc={body}
      style={{ height }}
      className="w-full border-0"
      sandbox="allow-same-origin"
      title="Email content"
    />
  );
};

const EmailCard: React.FC<{
  message: ImapMessage;
  defaultExpanded?: boolean;
  onReply: () => void;
  onForward: () => void;
}> = ({ message, defaultExpanded = false, onReply, onForward }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { mailData, createdAt } = message;
  const isSent = mailData.type === 'SENT';

  return (
    <div
      className={cn(
        'rounded-lg border bg-background shadow-sm overflow-hidden',
        isSent && 'border-blue-200',
      )}
    >
      <button
        className="w-full text-left hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <EmailHeader
              mailData={mailData}
              createdAt={createdAt}
              isSent={isSent}
            />
          </div>
          <span className="px-4 text-muted-foreground flex-none">
            {expanded ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )}
          </span>
        </div>
      </button>

      {expanded && (
        <>
          <Separator />
          <EmailBody body={mailData.body} />
          <Separator />
          <div className="flex gap-2 px-4 py-2">
            <Button size="sm" variant="secondary" onClick={onReply}>
              <IconArrowBackUp size={14} className="mr-1" />
              Reply
            </Button>
            <Button size="sm" variant="secondary" onClick={onForward}>
              <IconMailForward size={14} className="mr-1" />
              Forward
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

interface ComposeProps {
  mode: 'reply' | 'forward';
  defaultTo: string[];
  defaultFrom: string;
  defaultSubject: string;
  conversationId: string;
  integrationId: string;
  replyToMessageId?: string;
  references?: string[];
  onClose: () => void;
}

const ComposeSection: React.FC<ComposeProps> = ({
  mode,
  defaultTo,
  defaultFrom,
  defaultSubject,
  conversationId,
  integrationId,
  replyToMessageId,
  references,
  onClose,
}) => {
  const [to, setTo] = useState(defaultTo.join(', '));
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState(
    mode === 'reply' ? `Re: ${defaultSubject}` : `Fwd: ${defaultSubject}`,
  );
  const [body, setBody] = useState('');
  const [showCc, setShowCc] = useState(false);

  const { imapSendMail, loading } = useImapSendMail();

  const splitEmails = (val: string) =>
    val
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const handleSend = () => {
    const toList = splitEmails(to);
    if (!toList.length) {
      toast({
        title: 'Please enter at least one recipient',
        variant: 'destructive',
      });
      return;
    }
    if (!body.trim()) {
      toast({ title: 'Message body cannot be empty', variant: 'destructive' });
      return;
    }

    imapSendMail(
      {
        integrationId,
        conversationId,
        subject,
        body,
        to: toList,
        cc: showCc ? splitEmails(cc) : undefined,
        from: defaultFrom,
        replyToMessageId: mode === 'reply' ? replyToMessageId : undefined,
        references: mode === 'reply' ? references : undefined,
      },
      onClose,
    );
  };

  return (
    <div className="border rounded-lg bg-background shadow-sm overflow-hidden">
      <div className="px-4 py-2 bg-muted/40 flex items-center justify-between">
        <span className="text-sm font-medium capitalize">{mode}</span>
        <button
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          Discard
        </button>
      </div>

      <div className="divide-y text-sm">
        {/* From */}
        <div className="flex items-center px-4 h-9 gap-2">
          <span className="w-12 text-muted-foreground flex-none">From</span>
          <span className="text-foreground">{defaultFrom}</span>
        </div>

        {/* To */}
        <div className="flex items-center px-4 h-9 gap-2">
          <span className="w-12 text-muted-foreground flex-none">To</span>
          <input
            className="flex-1 bg-transparent outline-none"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="recipient@example.com"
          />
          <button
            className="text-xs text-muted-foreground hover:text-foreground ml-2"
            onClick={() => setShowCc((v) => !v)}
          >
            Cc
          </button>
        </div>

        {/* Cc (optional) */}
        {showCc && (
          <div className="flex items-center px-4 h-9 gap-2">
            <span className="w-12 text-muted-foreground flex-none">Cc</span>
            <input
              className="flex-1 bg-transparent outline-none"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc@example.com"
            />
          </div>
        )}

        {/* Subject */}
        <div className="flex items-center px-4 h-9 gap-2">
          <span className="w-12 text-muted-foreground flex-none">Subject</span>
          <input
            className="flex-1 bg-transparent outline-none"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        {/* Body */}
        <div
          className="min-h-[120px] max-h-[240px] overflow-y-auto px-4 py-3 focus-within:outline-none text-sm leading-relaxed"
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => setBody(e.currentTarget.innerHTML)}
          role="textbox"
          aria-multiline="true"
          aria-label="Email body"
        />
      </div>

      <div className="px-4 py-3 flex justify-end gap-2 bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button size="sm" onClick={handleSend} disabled={loading}>
          {loading ? (
            <Spinner size="sm" className="mr-1" />
          ) : (
            <IconSend size={14} className="mr-1" />
          )}
          Send
        </Button>
      </div>
    </div>
  );
};

/* =====================
   Main
===================== */

export const ImapConversationDetail: React.FC = () => {
  const { _id: conversationId, integration } = useConversationContext();
  const setIsInternalNote = useSetAtom(isInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);

  const [composeMode, setComposeMode] = useState<'reply' | 'forward' | null>(
    null,
  );
  const [composeTarget, setComposeTarget] = useState<ImapMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide internal-note toggle — IMAP uses its own reply UI
    setIsInternalNote(true);
    setOnlyInternal(true);
  }, []);

  const { data, loading, error } = useQuery<ImapConversationDetailResponse>(
    IMAP_CONVERSATION_DETAIL_QUERY,
    {
      variables: { conversationId },
      skip: !conversationId,
      fetchPolicy: 'cache-and-network',
    },
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [data?.imapConversationDetail?.length]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-destructive text-sm">
        Error loading emails: {error.message}
      </div>
    );
  }

  const messages = data?.imapConversationDetail ?? [];

  if (!messages.length) {
    return (
      <div className="p-10 text-center text-muted-foreground text-sm">
        No emails in this conversation
      </div>
    );
  }

  const fromEmail = deriveFromEmail(messages);
  const lastMessage = messages[messages.length - 1];

  const handleReply = (msg: ImapMessage) => {
    setComposeTarget(msg);
    setComposeMode('reply');
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50,
    );
  };

  const handleForward = (msg: ImapMessage) => {
    setComposeTarget(msg);
    setComposeMode('forward');
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      50,
    );
  };

  const getReplyTo = (msg: ImapMessage): string[] => {
    const { type, from, to } = msg.mailData;
    // Reply to the sender — if it's an incoming message, reply to `from`
    // If it's a sent message being replied to (unusual), reply to `to`
    if (type === 'SENT')
      return (to || []).map((e) => e.email || '').filter(Boolean);
    return (from || []).map((e) => e.email || '').filter(Boolean);
  };

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-3 p-4 max-w-2xl mx-auto">
        {messages.map((msg, idx) => (
          <EmailCard
            key={msg._id}
            message={msg}
            defaultExpanded={idx === messages.length - 1}
            onReply={() => handleReply(msg)}
            onForward={() => handleForward(msg)}
          />
        ))}

        {composeMode && composeTarget && (
          <ComposeSection
            mode={composeMode}
            defaultTo={getReplyTo(composeTarget)}
            defaultFrom={fromEmail}
            defaultSubject={composeTarget.mailData.subject || ''}
            conversationId={conversationId || ''}
            integrationId={integration?._id || ''}
            replyToMessageId={composeTarget.mailData.messageId}
            references={[composeTarget.mailData.messageId || '']}
            onClose={() => {
              setComposeMode(null);
              setComposeTarget(null);
            }}
          />
        )}

        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};
