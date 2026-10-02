import React, { useState } from 'react';
import { Spinner, cn, toast } from 'erxes-ui';
import { IconSend, IconX } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type {
  ComposeMode,
  MailComposePayload,
} from '@/integrations/mail/types/mailThread';
import { stripSubjectPrefix } from '@/integrations/mail/utils/mailThread';
import { toHtml } from '@/integrations/mail/utils/directMailComposer';
import type { MailDeliveryOutcome } from '@/integrations/mail/types/mailDelivery';
import { useMailMessageRetry } from '@/integrations/mail/hooks/useMailConversationDetail';

const COMPOSE_TITLE_KEYS: Record<ComposeMode, string> = {
  reply: 'reply',
  replyAll: 'reply-all',
  forward: 'forward',
  new: 'new-email',
};

interface ComposeProps {
  mode: ComposeMode;
  defaultTo: string[];
  defaultCc?: string[];
  defaultFrom: string;
  defaultSubject: string;
  defaultBody?: string;
  replyToMessageId?: string;
  references?: string[];
  sending: boolean;
  onSend: (
    payload: MailComposePayload,
    onSent: () => void,
    onOutcome?: (outcome: MailDeliveryOutcome) => void,
  ) => void;
  onClose: () => void;
}

export const MailThreadCompose: React.FC<ComposeProps> = ({
  mode,
  defaultTo,
  defaultCc,
  defaultFrom,
  defaultSubject,
  defaultBody,
  replyToMessageId,
  references,
  sending,
  onSend,
  onClose,
}) => {
  const { t } = useTranslation('frontline');
  const [failedDelivery, setFailedDelivery] = useState<MailDeliveryOutcome>();
  const { mailMessageRetry, loading: retrying } = useMailMessageRetry();
  const busy = sending || retrying;
  const [to, setTo] = useState(defaultTo.join(', '));
  const [cc, setCc] = useState(defaultCc?.join(', ') ?? '');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState(() => {
    const base = stripSubjectPrefix(defaultSubject);

    if (mode === 'new') {
      return base;
    }

    return mode === 'forward' ? `Fwd: ${base}` : `Re: ${base}`;
  });
  const [showCc, setShowCc] = useState(Boolean(defaultCc?.length));
  const [showBcc, setShowBcc] = useState(false);
  const [bodyText, setBodyText] = useState(() =>
    defaultBody
      ? new DOMParser()
          .parseFromString(
            defaultBody
              .replace(/<br\s*(?:\/\s*)?>/gi, '\n')
              .replace(/<\/(?:p|div|blockquote)>/gi, '\n'),
            'text/html',
          )
          .body.textContent?.trim() ?? ''
      : '',
  );

  const split = (v: string) =>
    v
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const send = () => {
    if (busy) return;
    if (failedDelivery) {
      mailMessageRetry(failedDelivery._id, onClose);
      return;
    }
    const toList = split(to);
    if (!toList.length) {
      toast({
        title: t('enter-at-least-one-recipient'),
        variant: 'destructive',
      });
      return;
    }
    if (!bodyText.trim()) {
      toast({
        title: t('message-body-cannot-be-empty'),
        variant: 'destructive',
      });
      return;
    }

    onSend(
      {
        subject,
        body: toHtml(bodyText.trim()),
        to: toList,
        cc: showCc && cc ? split(cc) : undefined,
        bcc: showBcc && bcc ? split(bcc) : undefined,
        replyToMessageId: mode !== 'forward' ? replyToMessageId : undefined,
        references: mode !== 'forward' ? references : undefined,
      },
      onClose,
      (outcome) => {
        if (outcome.deliveryStatus === 'failed') setFailedDelivery(outcome);
      },
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
    <div className="mb-3 overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_3px_rgba(0,0,0,0.18),0_4px_8px_rgba(0,0,0,0.08)]">
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

      <fieldset disabled={busy || Boolean(failedDelivery)}>
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
            placeholder={
              mode === 'reply' || mode === 'replyAll' ? '' : t('recipients')
            }
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
            onChange={(e) => setSubject(e.target.value)}
            onKeyDown={onKey}
          />
        </div>

        <textarea
          className="min-h-[120px] max-h-[260px] w-full resize-y overflow-y-auto px-4 py-3 text-[14px] leading-relaxed focus:outline-none"
          value={bodyText}
          onChange={(event) => setBodyText(event.target.value)}
          onKeyDown={onKey}
          aria-label={t('email-body')}
          placeholder={t('write-your-message')}
        />
      </fieldset>

      {failedDelivery && (
        <div role="alert" className="px-4 py-2 text-sm text-destructive">
          {failedDelivery.deliveryError || t('email-not-delivered')}
          <p>
            Retry this message or close the composer to start another email.
          </p>
        </div>
      )}

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
            disabled={busy}
          >
            {t('discard')}
          </button>
          <button
            type="button"
            className={cn(
              'flex items-center gap-1.5 text-[13px] font-medium px-4 py-1.5 rounded-full transition-colors',
              busy
                ? 'bg-info/50 text-foreground/60 cursor-not-allowed'
                : 'bg-info text-foreground hover:bg-info/20',
            )}
            onClick={send}
            disabled={busy}
          >
            {busy ? <Spinner size="sm" /> : <IconSend size={13} />}
            {t(failedDelivery ? 'email-delivery-retry' : 'send')}
          </button>
        </div>
      </div>
    </div>
  );
};
