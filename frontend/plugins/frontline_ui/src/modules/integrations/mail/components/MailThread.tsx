import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  IconArrowBackUp,
  IconMailForward,
  IconMailPlus,
  IconSend,
  IconUsers,
} from '@tabler/icons-react';
import type {
  ComposeMode,
  MailComposePayload,
  MailMessage,
} from '@/integrations/mail/types/mailThread';
import {
  buildQuote,
  deriveSenderAddress,
  stripSubjectPrefix,
} from '@/integrations/mail/utils/mailThread';
import { MailThreadMessage } from './MailThreadMessage';
import { MailThreadCompose } from './MailThreadCompose';
import { MailThreadActionsContext } from '@/integrations/mail/hooks/useMailThreadActions';

export type {
  MailComposePayload,
  MailMessage,
} from '@/integrations/mail/types/mailThread';

export interface MailThreadProps {
  messages: MailMessage[];
  hasMore?: boolean;
  loading: boolean;
  sending: boolean;
  error?: string;
  onLoadMore: () => void;
  onSend: (payload: MailComposePayload, onSent: () => void) => void;
  className?: string;
  emptyLabel?: string;
  startAddress?: string;
  startSubject?: string;
  readOnly?: boolean;
  onNewEmail?: (email: string) => void;
  beforeCompose?: React.ReactNode;
}

// skipcq: JS-R1005
export const MailThread: React.FC<MailThreadProps> = ({
  messages,
  hasMore,
  loading,
  sending,
  error,
  onLoadMore,
  onSend,
  className,
  emptyLabel,
  startAddress,
  startSubject,
  readOnly,
  onNewEmail,
  beforeCompose,
}) => {
  const { t } = useTranslation('frontline');
  const [composeMode, setComposeMode] = useState<ComposeMode | null>(null);
  const [composeTarget, setComposeTarget] = useState<MailMessage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const newestId = messages[messages.length - 1]?._id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newestId]);

  if (loading && !messages.length) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-destructive/80">
        {t('failed-to-load-emails', { message: error })}
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className={cn('max-w-3xl mx-auto space-y-3', className)}>
        <div className="flex flex-col h-40 items-center justify-center gap-2 text-[#5f6368]">
          <IconMailForward size={32} strokeWidth={1.2} />
          <span className="text-[13px]">
            {emptyLabel ?? t('no-emails-in-conversation')}
          </span>
          {startAddress && !readOnly && composeMode !== 'new' && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.15)] px-3 py-1 text-[12px] font-medium text-[#3c4043] transition-colors hover:bg-background/[0.04] dark:border-[rgba(255,255,255,0.15)] dark:text-[#e8eaed]"
              onClick={() => setComposeMode('new')}
            >
              <IconSend size={13} />
              {t('write-email', 'Write an email')}
            </button>
          )}
        </div>

        {startAddress && composeMode === 'new' && (
          <MailThreadCompose
            mode="new"
            defaultTo={[]}
            defaultFrom={startAddress}
            defaultSubject={startSubject ?? ''}
            sending={sending}
            onSend={onSend}
            onClose={() => setComposeMode(null)}
          />
        )}
      </div>
    );
  }

  const fromEmail = deriveSenderAddress(messages);
  const baseSubject = stripSubjectPrefix(messages[0]?.mailData.subject ?? '');
  const latestMessage = messages[messages.length - 1];
  const latestContactEmail =
    latestMessage.mailData.type === 'INBOX'
      ? latestMessage.mailData.from?.[0]?.email
      : latestMessage.mailData.to?.[0]?.email;

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
    <div className={cn('space-y-3', className)}>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-1 pb-3">
        <h2 className="min-w-0 truncate text-lg font-medium text-foreground">
          {baseSubject || t('no-subject', '(No subject)')}
        </h2>
        {!readOnly && (
          <div className="flex shrink-0 items-center rounded-full border border-border p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => open(latestMessage, 'reply')}
              title={t('reply')}
              aria-label={t('reply')}
            >
              <IconArrowBackUp className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => open(latestMessage, 'replyAll')}
              title={t('reply-all')}
              aria-label={t('reply-all')}
            >
              <IconUsers className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 rounded-full"
              onClick={() => open(latestMessage, 'forward')}
              title={t('forward')}
              aria-label={t('forward')}
            >
              <IconMailForward className="size-4" />
            </Button>
            {onNewEmail && latestContactEmail && (
              <>
                <span className="mx-0.5 h-4 w-px bg-border" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 rounded-full"
                  onClick={() => onNewEmail(latestContactEmail)}
                  title={t('new-email', 'New email')}
                  aria-label={t('new-email', 'New email')}
                >
                  <IconMailPlus className="size-4" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-[rgba(0,0,0,0.15)] px-3 py-1 text-[12px] font-medium text-[#3c4043] transition-colors hover:bg-background/[0.04] disabled:opacity-60 dark:border-[rgba(255,255,255,0.15)] dark:text-[#e8eaed]"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading && <Spinner size="sm" />}
            {t('show-earlier-messages')}
          </button>
        </div>
      )}

      <MailThreadActionsContext.Provider value={{ open, readOnly, onNewEmail }}>
        <div className="space-y-3">
          {messages.map((msg, idx) => (
            <MailThreadMessage
              key={msg._id}
              message={msg}
              defaultExpanded={idx === messages.length - 1}
            />
          ))}
        </div>
      </MailThreadActionsContext.Provider>

      {beforeCompose}

      {composeMode && composeTarget && (
        <MailThreadCompose
          key={`${composeMode}-${composeTarget._id}`}
          mode={composeMode}
          defaultTo={getTo(composeTarget, composeMode)}
          defaultCc={getCc(composeTarget, composeMode)}
          defaultFrom={fromEmail}
          defaultSubject={composeTarget.mailData.subject ?? ''}
          defaultBody={
            composeMode === 'forward' ? buildQuote(composeTarget) : ''
          }
          replyToMessageId={composeTarget.mailData.messageId}
          references={composeTarget.mailData.references ?? []}
          sending={sending}
          onSend={onSend}
          onClose={close}
        />
      )}

      <div ref={bottomRef} />
    </div>
  );
};
