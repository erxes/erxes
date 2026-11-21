import type { EmailSettings } from '@erxes/core-contract';
import { Input, Label } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { CopyButton } from '~/modules/assistant/CopyButton';
import { FormSection } from '../integrations/FormSection';
import { OverviewSection } from '../integrations/IntegrationLayout';

type EventsKey = 'eventsKey' | 'configurationSet' | 'eventsTopicArn';

export type EventsDraft = Record<EventsKey, string>;

/** What each provider needs to report bounces and complaints back. */
const EVENTS_FIELDS = {
  smtp: [],
  sendgrid: [
    {
      key: 'eventsKey',
      label: 'Verification key',
      placeholder: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE…',
    },
  ],
  ses: [
    { key: 'configurationSet', label: 'Configuration set', placeholder: 'erxes' },
    {
      key: 'eventsTopicArn',
      label: 'SNS topic ARN',
      placeholder: 'arn:aws:sns:us-east-1:123456789012:email-events',
    },
  ],
} satisfies Record<
  EmailSettings['provider'],
  { key: EventsKey; label: string; placeholder: string }[]
>;

/** The settings form's fields for the provider's events; none for an SMTP server. */
export const EventsFields = ({
  provider,
  draft,
  onChange,
}: {
  provider: EmailSettings['provider'];
  draft: EventsDraft;
  onChange: (key: EventsKey, value: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const id = useId();
  const fields = EVENTS_FIELDS[provider];

  if (!fields.length) return null;

  return (
    <FormSection
      title={t('section.events', 'Bounces and complaints')}
      description={t(
        `section.events-description.${provider}`,
        provider === 'sendgrid'
          ? 'The Signed Event Webhook’s verification key, from SendGrid’s Mail Settings.'
          : 'The configuration set every email names, and the SNS topic of its event destination.',
      )}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1.5">
            <Label htmlFor={`${id}-${key}`}>{t(`field.${provider}.${key}`, label)}</Label>
            <Input
              id={`${id}-${key}`}
              value={draft[key]}
              placeholder={placeholder}
              autoComplete="off"
              onChange={(event) => onChange(key, event.target.value)}
            />
          </div>
        ))}
      </div>
    </FormSection>
  );
};

/** Where the provider posts its events, and whether they are taken yet. */
export const EventsHelp = ({ saved }: { saved: EmailSettings }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  if (!saved.eventsUrl || saved.provider === 'smtp') return null;

  const ready = saved.provider === 'sendgrid' ? !!saved.eventsKey : !!saved.eventsTopicArn;

  return (
    <OverviewSection title={t('section.events', 'Bounces and complaints')}>
      <div className="space-y-2 rounded-lg border p-4 text-sm">
        <p className="text-muted-foreground">
          {t(
            `events-help.${saved.provider}`,
            saved.provider === 'sendgrid'
              ? 'Post SendGrid’s Event Webhook (signed) here: bounced and complained addresses get no more email.'
              : 'Subscribe this address over HTTPS to the configuration set’s SNS topic: bounced and complained addresses get no more email.',
          )}
        </p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs">
            {saved.eventsUrl}
          </code>
          <CopyButton text={saved.eventsUrl} />
        </div>
        {!ready && (
          <p className="text-xs text-warning-text">
            {t(
              `events-missing.${saved.provider}`,
              saved.provider === 'sendgrid'
                ? 'Events are refused until you add the verification key in Settings.'
                : 'Events are refused until you add the SNS topic in Settings.',
            )}
          </p>
        )}
      </div>
    </OverviewSection>
  );
};
