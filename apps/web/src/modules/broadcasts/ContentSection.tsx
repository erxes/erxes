import type { BroadcastPlaceholder } from '@erxes/core-contract';
import { Input, Label, Textarea } from 'erxes-ui';
import { lazy, Suspense, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FromAddressPicker } from '~/components/FromAddressPicker';
import { MailConnectionSelect } from '~/components/MailConnectionSelect';
import { ReplyToSelect } from '~/components/ReplyToSelect';
import { SenderLabelInput } from '~/components/SenderLabelInput';
import { useFromAddress } from '~/components/useFromAddress';
import { LabelRow } from './PlaceholderMenu';
import { TemplatePicker } from './templates/TemplatePicker';
import { useTemplatesOffered } from './templates/useEmailTemplates';
import type { BroadcastDraft } from './useBroadcastDraft';

/** The email editor loads the first time an email is opened. */
const EmailEditor = lazy(async () => ({
  default: (await import('./EmailEditor')).EmailEditor,
}));

/** A field as text: `{{ firstName }}`, which core fills per customer. */
const fieldToken = (name: BroadcastPlaceholder) => `{{ ${name} }}`;

const GREETING = '{{ firstName | there }}';

/**
 * GSM-7 text fits 160 characters in one SMS (153 when split); anything else 70 (67). Plain
 * ASCII stands in for GSM-7, so a few GSM extras count as Unicode: the estimate only goes up.
 */
const smsParts = (text: string) => {
  const plain = /^[\n\r -~]*$/.test(text);
  const [single, part] = plain ? [160, 153] : [70, 67];

  return text.length <= single ? 1 : Math.ceil(text.length / part);
};

type TextElement = HTMLInputElement | HTMLTextAreaElement;

/** Puts a field where the cursor is in an input, and the cursor after it. */
const useInsertAtCursor = <T extends TextElement>(
  value: string,
  onChange: (next: string) => void,
) => {
  const ref = useRef<T>(null);

  const insert = (name: BroadcastPlaceholder) => {
    const element = ref.current;
    const token = fieldToken(name);
    const start = element?.selectionStart ?? value.length;
    const end = element?.selectionEnd ?? value.length;

    onChange(value.slice(0, start) + token + value.slice(end));
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return { ref, insert };
};

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  withFields = false,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  /** Offer Insert a field, for text that's filled per customer. */
  withFields?: boolean;
}) => {
  const id = useId();
  const { ref, insert } = useInsertAtCursor<HTMLInputElement>(value ?? '', onChange);

  return (
    <div className="space-y-1.5">
      <LabelRow id={id} label={label} onPick={withFields ? insert : undefined} />
      <Input
        id={id}
        ref={ref}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
};

interface SectionProps {
  channel: 'email' | 'sms';
  draft: BroadcastDraft;
  onChange: (patch: Partial<BroadcastDraft>) => void;
}

/**
 * What it goes out through (a Mail service connection, or Organization email), who it comes
 * from (the label after the organisation's name on SaaS), the address when Organization email's
 * provider verified domains to pick from, and where replies go.
 */
const SenderFields = ({ draft, onChange }: Omit<SectionProps, 'channel'>) => {
  const { t } = useTranslation('broadcasts');
  const connectionId = useId();
  const nameId = useId();
  const addressId = useId();
  const replyId = useId();
  const from = useFromAddress(draft.fromEmail, (fromEmail) => onChange({ fromEmail }));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor={connectionId}>{t('send-through', 'Send through')}</Label>
        <MailConnectionSelect
          id={connectionId}
          value={draft.mailConnectionId}
          onChange={(mailConnectionId) => onChange({ mailConnectionId })}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={nameId}>{t('from-name', 'From name')}</Label>
        <SenderLabelInput
          id={nameId}
          value={draft.fromName}
          fromEmail={draft.fromEmail}
          connectionId={draft.mailConnectionId}
          onChange={(fromName) => onChange({ fromName })}
        />
      </div>
      {from.shown && !draft.mailConnectionId && (
        <div className="space-y-1.5">
          <Label htmlFor={addressId}>{t('from-address', 'From address')}</Label>
          <FromAddressPicker id={addressId} from={from} />
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor={replyId}>{t('reply-to', 'Replies go to')}</Label>
        <ReplyToSelect
          id={replyId}
          value={draft.replyTo}
          onChange={(replyTo) => onChange({ replyTo })}
        />
      </div>
    </div>
  );
};

/** An email's subject, preview text and sender. */
const EmailFields = ({ draft, onChange }: Omit<SectionProps, 'channel'>) => {
  const { t } = useTranslation('broadcasts');

  return (
    <>
      <TextField
        withFields
        label={t('subject', 'Subject')}
        value={draft.subject}
        onChange={(subject) => onChange({ subject })}
        placeholder={t('subject-placeholder', 'News for {{field}}', {
          field: '{{ firstName | you }}',
        })}
      />
      <TextField
        withFields
        label={t('preheader', 'Preview text')}
        value={draft.preheader}
        onChange={(preheader) => onChange({ preheader })}
        hint={t('preheader-hint', 'Shown after the subject in most inboxes.')}
      />
      <SenderFields draft={draft} onChange={onChange} />
    </>
  );
};

/** What it says: subject, preheader and sender for email; the message or SMS text with fields. */
export const ContentSection = ({
  unknownPlaceholders,
  ...props
}: SectionProps & { unknownPlaceholders: string[] }) => (
  <section className="space-y-4">
    {props.channel === 'email' && <EmailFields draft={props.draft} onChange={props.onChange} />}
    {props.channel === 'email' ? <EmailBody {...props} /> : <SmsBody {...props} />}
    {unknownPlaceholders.length > 0 && <UnknownPlaceholders names={unknownPlaceholders} />}
  </section>
);

const UnknownPlaceholders = ({ names }: { names: string[] }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <p className="text-sm text-destructive-text">
      {t('unknown-placeholders', "erxes can't fill {{names}}. Use Insert a field.", {
        names: names.map((name) => `{{ ${name} }}`).join(', '),
      })}
    </p>
  );
};

/** The email's message in the email editor; self-hosted, with its templates by the label. */
const EmailBody = ({ draft, onChange }: SectionProps) => {
  const { t } = useTranslation('broadcasts');
  const label = t('body-email', 'Message');
  const templates = useTemplatesOffered();

  return (
    <div className="space-y-1.5">
      <Suspense
        fallback={
          <>
            <LabelRow label={label} />
            <div className="h-64 rounded-md shadow-xs" />
          </>
        }
      >
        <EmailEditor
          label={label}
          value={draft.content}
          onChange={(content) => onChange({ content })}
          actions={
            templates && (
              <TemplatePicker content={draft.content} onUse={(content) => onChange({ content })} />
            )
          }
        />
      </Suspense>
      <p className="text-xs text-muted-foreground">
        {t(
          'body-email-hint',
          'Type / for blocks and pictures, {{trigger}} or Insert a field for a customer’s name. An unsubscribe link is added at the end.',
          { trigger: '{{' },
        )}
      </p>
    </div>
  );
};

/** The SMS text, with a menu that puts a field where the cursor is. */
const SmsBody = ({ draft, onChange }: SectionProps) => {
  const { t } = useTranslation('broadcasts');
  const id = useId();

  const { ref, insert } = useInsertAtCursor<HTMLTextAreaElement>(draft.body, (body) =>
    onChange({ body }),
  );

  return (
    <div className="space-y-1.5">
      <LabelRow id={id} label={t('body-sms', 'Text')} onPick={insert} />
      <Textarea
        id={id}
        ref={ref}
        rows={6}
        value={draft.body}
        onChange={(event) => onChange({ body: event.target.value })}
        placeholder={t('body-sms-placeholder', 'Hi {{field}}, …', { field: GREETING })}
      />
      <p className="text-xs text-muted-foreground">
        {t('sms-length', '{{count}} characters · {{parts}} SMS each, before the stop link', {
          count: draft.body.length,
          parts: smsParts(draft.body),
        })}
      </p>
    </div>
  );
};
