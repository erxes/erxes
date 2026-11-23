import type { EmailSettings, EmailSettingsInput } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconCircleCheck } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Checkbox, Input, Label, Select, Spinner, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EventsFields } from './EmailEvents';
import { useCheckDomains } from './VerifiedDomains';
import { FormSection } from '../integrations/FormSection';

type Provider = EmailSettings['provider'];

const PROVIDERS: Provider[] = ['smtp', 'sendgrid', 'ses'];

export const PROVIDER_NAMES: Record<Provider, string> = {
  smtp: 'SMTP server',
  sendgrid: 'SendGrid',
  ses: 'Amazon SES',
};

const draftOf = (saved: EmailSettings | null) => ({
  provider: saved?.provider ?? 'smtp',
  fromName: saved?.fromName ?? '',
  fromEmail: saved?.fromEmail ?? '',
  smtpHost: saved?.smtpHost ?? '',
  smtpPort: String(saved?.smtpPort ?? 587),
  smtpSecure: saved?.smtpSecure ?? false,
  username: saved?.username ?? '',
  region: saved?.region ?? '',
  secret: '',
  eventsKey: saved?.eventsKey ?? '',
  configurationSet: saved?.configurationSet ?? '',
  eventsTopicArn: saved?.eventsTopicArn ?? '',
});

type Draft = ReturnType<typeof draftOf>;

type TextKey =
  | 'fromName'
  | 'fromEmail'
  | 'smtpHost'
  | 'smtpPort'
  | 'username'
  | 'region'
  | 'secret';

/** What the form sends for its provider; an empty secret keeps the saved one. */
const inputOf = (draft: Draft): EmailSettingsInput => {
  const sender = {
    fromName: draft.fromName,
    fromEmail: draft.fromEmail,
    secret: draft.secret || undefined,
  };

  if (draft.provider === 'sendgrid') {
    return { provider: 'sendgrid', ...sender, eventsKey: draft.eventsKey };
  }

  if (draft.provider === 'ses') {
    return {
      provider: 'ses',
      ...sender,
      region: draft.region,
      username: draft.username,
      configurationSet: draft.configurationSet,
      eventsTopicArn: draft.eventsTopicArn,
    };
  }

  return {
    provider: 'smtp',
    ...sender,
    smtpHost: draft.smtpHost,
    smtpPort: Number(draft.smtpPort) || 587,
    smtpSecure: draft.smtpSecure,
    username: draft.username,
  };
};

/** The fields each provider needs, besides its secret. */
const CONNECTION_FIELDS: Record<Provider, { key: TextKey; label: string; placeholder: string }[]> =
  {
    smtp: [
      { key: 'smtpHost', label: 'Server', placeholder: 'smtp.example.com' },
      { key: 'smtpPort', label: 'Port', placeholder: '587' },
      { key: 'username', label: 'User name', placeholder: '' },
    ],
    sendgrid: [],
    ses: [
      { key: 'region', label: 'AWS region', placeholder: 'us-east-1' },
      { key: 'username', label: 'Access key id', placeholder: 'AKIA…' },
    ],
  };

const SECRET_LABELS: Record<Provider, string> = {
  smtp: 'Password',
  sendgrid: 'API key',
  ses: 'Secret access key',
};

const useSave = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const { toast } = useToast();
  const client = useQueryClient();
  const checkDomains = useCheckDomains();

  return useMutation(
    orpc.emails.saveSettings.mutationOptions({
      onSuccess: (saved) => {
        void client.invalidateQueries({ queryKey: orpc.emails.settings.key() });
        toast({ title: t('saved', 'Email settings saved') });

        // New settings may reach another account: ask it which domains it sends from.
        if (saved.provider !== 'smtp') checkDomains.mutate({});
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('save-failed', 'Could not save'),
          description: messageOf(error),
        }),
    }),
  );
};

const ProviderPicker = ({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (draft: Draft) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{t('field.provider', 'Send through')}</Label>
      <Select
        value={draft.provider}
        onValueChange={(next) =>
          next && onChange({ ...draft, provider: next, username: '', secret: '' })
        }
      >
        <Select.Trigger id={id}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {PROVIDERS.map((provider) => (
            <Select.Item key={provider} value={provider}>
              {t(`provider.${provider}`, PROVIDER_NAMES[provider])}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

/** The saved secret is never shown: this says it is there, and that a typed one replaces it. */
const SecretSaved = ({ provider }: { provider: Provider }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });

  return (
    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <IconCircleCheck className="size-3.5 text-(--success-text)" />
      {t(`secret-saved.${provider}`, {
        defaultValue: `The ${SECRET_LABELS[provider].toLowerCase()} is saved. Type a new one only to replace it.`,
      })}
    </p>
  );
};

/** Sender, provider and how to reach it; the saved secret is never shown. */
const FormSections = ({
  draft,
  saved,
  onChange,
}: {
  draft: Draft;
  saved: EmailSettings | null;
  onChange: (draft: Draft) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const id = useId();
  // The server keeps the saved secret for the same provider and user (`secretFor`); it is never sent back.
  const secretKept = saved?.provider === draft.provider && saved.username === draft.username;

  // Connection labels differ by provider (`field.ses.username`: the access key id).
  const field = (key: TextKey, label: string, placeholder = '', type = 'text') => (
    <div key={key} className="space-y-1.5">
      <Label htmlFor={`${id}-${key}`}>
        {t(key.startsWith('from') ? `field.${key}` : `field.${draft.provider}.${key}`, label)}
      </Label>
      <Input
        id={`${id}-${key}`}
        type={type}
        value={draft[key]}
        placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : 'off'}
        inputMode={key === 'smtpPort' ? 'numeric' : undefined}
        onChange={(event) => onChange({ ...draft, [key]: event.target.value })}
      />
    </div>
  );

  return (
    <>
      <FormSection
        title={t('section.sender', 'Sender')}
        description={t('section.sender-description', 'Who your emails come from.')}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {field('fromName', 'From name', 'Acme')}
          {field('fromEmail', 'From address', 'hello@example.com', 'email')}
        </div>
      </FormSection>
      <FormSection
        title={t('section.connection', 'Connection')}
        description={t(
          'section.connection-description',
          'Your own SMTP server, or a SendGrid or Amazon SES account that may send from the address above.',
        )}
      >
        <ProviderPicker draft={draft} onChange={onChange} />
        <div className="grid gap-3 sm:grid-cols-2">
          {CONNECTION_FIELDS[draft.provider].map(({ key, label, placeholder }) =>
            field(key, label, placeholder),
          )}
          {field(
            'secret',
            SECRET_LABELS[draft.provider],
            secretKept ? '••••••••••••' : '',
            'password',
          )}
        </div>
        {draft.provider === 'smtp' && (
          <span className="flex items-center gap-2 text-sm">
            <Checkbox
              id={`${id}-secure`}
              checked={draft.smtpSecure}
              onCheckedChange={(on) => onChange({ ...draft, smtpSecure: on })}
            />
            <label htmlFor={`${id}-secure`}>
              {t('field.smtp.smtpSecure', 'TLS from the start (port 465)')}
            </label>
          </span>
        )}
        {secretKept && <SecretSaved provider={draft.provider} />}
      </FormSection>
      <EventsFields
        provider={draft.provider}
        draft={draft}
        onChange={(key, value) => onChange({ ...draft, [key]: value })}
      />
    </>
  );
};

/** Sets email sending up, or changes it; the draft starts from `saved`. */
export const EmailForm = ({ saved }: { saved: EmailSettings | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.email' });
  const [draft, setDraft] = useState(() => draftOf(saved));
  const save = useSave();

  const incomplete =
    !draft.fromEmail ||
    (draft.provider === 'smtp' && !draft.smtpHost) ||
    (draft.provider === 'ses' && (!draft.region || !draft.username)) ||
    (!saved && draft.provider !== 'smtp' && !draft.secret);

  return (
    <div className="space-y-6">
      <FormSections draft={draft} saved={saved} onChange={setDraft} />
      <div className="flex justify-end">
        <Button disabled={save.isPending || incomplete} onClick={() => save.mutate(inputOf(draft))}>
          {save.isPending ? (
            <Spinner size="sm" />
          ) : saved ? (
            t('save', 'Save changes')
          ) : (
            t('set-up', 'Set up email sending')
          )}
        </Button>
      </div>
    </div>
  );
};
