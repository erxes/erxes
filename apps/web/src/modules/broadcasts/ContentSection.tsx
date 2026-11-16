import { BROADCAST_PLACEHOLDERS, type BroadcastPlaceholder } from '@erxes/core-contract';
import { IconBraces } from '@tabler/icons-react';
import { Button, DropdownMenu, Input, Label, Textarea } from 'erxes-ui';
import { useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { BroadcastDraft } from './useBroadcastDraft';

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

const PlaceholderMenu = ({ onPick }: { onPick: (name: BroadcastPlaceholder) => void }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger render={<Button variant="ghost" size="sm" />}>
        <IconBraces />
        {t('insert-placeholder', 'Insert a field')}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {BROADCAST_PLACEHOLDERS.map((name) => (
          <DropdownMenu.Item key={name} onClick={() => onPick(name)}>
            {t(`placeholder.${name}`, name)}
            <span className="ml-auto font-mono text-xs text-muted-foreground">{`{{ ${name} }}`}</span>
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const TextField = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
}) => {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
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

/** An email's subject, preview text and sender. */
const EmailFields = ({ draft, onChange }: Omit<SectionProps, 'channel'>) => {
  const { t } = useTranslation('broadcasts');

  return (
    <>
      <TextField
        label={t('subject', 'Subject')}
        value={draft.subject}
        onChange={(subject) => onChange({ subject })}
        placeholder={t('subject-placeholder', 'News for {{field}}', {
          field: '{{ firstName | you }}',
        })}
      />
      <TextField
        label={t('preheader', 'Preview text')}
        value={draft.preheader}
        onChange={(preheader) => onChange({ preheader })}
        hint={t('preheader-hint', 'Shown after the subject in most inboxes.')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label={t('from-name', 'From name')}
          value={draft.fromName}
          onChange={(fromName) => onChange({ fromName })}
          hint={t('from-name-hint', "The address stays the deployment's sender.")}
        />
        <TextField
          label={t('reply-to', 'Replies go to')}
          value={draft.replyTo}
          onChange={(replyTo) => onChange({ replyTo })}
          placeholder="team@example.com"
        />
      </div>
    </>
  );
};

/** What it says: subject, preheader and sender for email; the Markdown or SMS text with fields. */
export const ContentSection = ({
  unknownPlaceholders,
  ...props
}: SectionProps & { unknownPlaceholders: string[] }) => (
  <section className="space-y-4">
    {props.channel === 'email' && <EmailFields draft={props.draft} onChange={props.onChange} />}
    <BodyField {...props} />
    {unknownPlaceholders.length > 0 && <UnknownPlaceholders names={unknownPlaceholders} />}
  </section>
);

const UnknownPlaceholders = ({ names }: { names: string[] }) => {
  const { t } = useTranslation('broadcasts');

  return (
    <p className="text-sm text-destructive">
      {t('unknown-placeholders', "erxes can't fill {{names}}. Use Insert a field.", {
        names: names.map((name) => `{{ ${name} }}`).join(', '),
      })}
    </p>
  );
};

/** The message, with a menu that puts a field where the cursor is. */
const BodyField = ({ channel, draft, onChange }: SectionProps) => {
  const { t } = useTranslation('broadcasts');
  const bodyId = useId();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // The field goes where the cursor is, and the cursor after it.
  const insert = (name: BroadcastPlaceholder) => {
    const element = bodyRef.current;
    const token = `{{ ${name} }}`;
    const start = element?.selectionStart ?? draft.body.length;
    const end = element?.selectionEnd ?? draft.body.length;

    onChange({ body: draft.body.slice(0, start) + token + draft.body.slice(end) });
    requestAnimationFrame(() => {
      element?.focus();
      element?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={bodyId}>
          {channel === 'email' ? t('body-email', 'Message (Markdown)') : t('body-sms', 'Text')}
        </Label>
        <PlaceholderMenu onPick={insert} />
      </div>
      <Textarea
        id={bodyId}
        ref={bodyRef}
        rows={channel === 'email' ? 16 : 6}
        value={draft.body}
        onChange={(event) => onChange({ body: event.target.value })}
        placeholder={
          channel === 'email'
            ? t('body-email-placeholder', 'Hi {{field}},\n\n**News** …', { field: GREETING })
            : t('body-sms-placeholder', 'Hi {{field}}, …', { field: GREETING })
        }
      />
      <p className="text-xs text-muted-foreground">
        {channel === 'email'
          ? t(
              'body-email-hint',
              'Markdown: **bold**, _italic_, [links](https://…), lists. An unsubscribe link is added at the end.',
            )
          : t('sms-length', '{{count}} characters · {{parts}} SMS each, before the stop link', {
              count: draft.body.length,
              parts: smsParts(draft.body),
            })}
      </p>
    </div>
  );
};
