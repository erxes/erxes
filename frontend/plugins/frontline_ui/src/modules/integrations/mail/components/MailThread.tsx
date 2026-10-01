import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
  MailMessage,
  MailThreadProps,
} from '@/integrations/mail/types/mailThread';
import {
  buildQuote,
  deriveSenderAddress,
  getReplyCc,
  getReplyRecipients,
  stripSubjectPrefix,
} from '@/integrations/mail/utils/mailThread';
import { groupMailReactions } from '@/integrations/mail/utils/mailReactions';
import { MailThreadMessage } from './MailThreadMessage';
import { MailThreadCompose } from './MailThreadCompose';
import { MailReactionMenu } from './MailReactionMenu';
import { MailThreadActionsContext } from '@/integrations/mail/hooks/useMailThreadActions';

// skipcq: JS-R1005
export const MailThread: React.FC<MailThreadProps> = ({
  conversationId,
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
  const { visibleMessages, reactionsByMessageId, orphanReactions } = useMemo(
    () => groupMailReactions(messages),
    [messages],
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [newestId]);

  const open = useCallback((msg: MailMessage, mode: ComposeMode) => {
    setComposeTarget(msg);
    setComposeMode(mode);
    setTimeout(
      () => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }),
      60,
    );
  }, []);
  const actions = useMemo(
    () => ({ open, readOnly, onNewEmail }),
    [open, readOnly, onNewEmail],
  );

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

  const fromEmail = deriveSenderAddress(visibleMessages);
  const baseSubject = stripSubjectPrefix(
    visibleMessages[0]?.mailData.subject ?? messages[0]?.mailData.subject ?? '',
  );
  const latestMessage =
    visibleMessages[visibleMessages.length - 1] ??
    messages[messages.length - 1];
  const latestContactEmail =
    latestMessage.mailData.type === 'INBOX'
      ? latestMessage.mailData.from?.[0]?.email
      : latestMessage.mailData.to?.[0]?.email;

  const close = () => {
    setComposeMode(null);
    setComposeTarget(null);
  };

  return (
    <div className={cn('min-w-0 space-y-3', className)}>
      <div className="flex min-h-12 flex-col items-stretch gap-2 border-b border-border px-1 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="min-w-0 truncate text-lg font-medium text-foreground">
          {baseSubject || t('no-subject', '(No subject)')}
        </h2>
        {!readOnly && (
          <div className="flex shrink-0 self-end items-center rounded-full border border-border p-0.5 sm:self-auto">
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
            <MailReactionMenu
              conversationId={conversationId}
              message={latestMessage}
              compact
            />
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

      <MailThreadActionsContext.Provider value={actions}>
        <div className="space-y-3">
          {visibleMessages.map((msg, idx) => (
            <MailThreadMessage
              key={msg._id}
              message={msg}
              conversationId={conversationId}
              reactions={reactionsByMessageId.get(msg.mailData.messageId ?? '')}
              defaultExpanded={idx === visibleMessages.length - 1}
            />
          ))}
          {orphanReactions.map((reaction) => (
            <div
              key={reaction.messageId}
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground"
            >
              {reaction.sender} reacted {reaction.emoji}
            </div>
          ))}
        </div>
      </MailThreadActionsContext.Provider>

      {beforeCompose}

      {composeMode && composeTarget && (
        <MailThreadCompose
          key={`${composeMode}-${composeTarget._id}`}
          mode={composeMode}
          defaultTo={getReplyRecipients(composeTarget, composeMode)}
          defaultCc={getReplyCc(composeTarget, composeMode, fromEmail)}
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
