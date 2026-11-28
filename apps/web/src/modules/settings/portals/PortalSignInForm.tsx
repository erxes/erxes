import type { Portal } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQueries, useQuery } from '@tanstack/react-query';
import { Button, Form, Select, Spinner, Switch } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useSavePortal } from './useSavePortal';

const OFF = 'off';

type SignIn = Pick<
  Portal,
  | 'emailSignIn'
  | 'phoneSignIn'
  | 'phoneConnectionId'
  | 'phoneTexts'
  | 'smsConnectionId'
  | 'googleConnectionId'
  | 'appleConnectionId'
  | 'facebookConnectionId'
>;

/**
 * Off (or the default), or one of the organisation's connections of the integrations
 * (Settings › Integrations).
 */
const ConnectionSelect = ({
  integrations,
  label,
  offLabel,
  value,
  onChange,
  disabled,
}: {
  integrations: readonly string[];
  label: string;
  offLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });

  const connections = useQueries({
    queries: integrations.map((key) =>
      orpc.integrations.connections.queryOptions({ input: { key } }),
    ),
  });

  const list = connections
    .flatMap((query) => query.data?.data ?? [])
    .filter((connection) => connection.status === 'active' || connection.id === value);

  const pending = connections.some((query) => query.isPending);
  const [first] = integrations;

  return (
    <div className="space-y-1">
      <Select
        value={value ?? OFF}
        disabled={disabled}
        onValueChange={(next) => onChange(next === OFF ? null : next)}
      >
        <Select.Trigger aria-label={label}>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value={OFF}>{offLabel}</Select.Item>
          {list.map((connection) => (
            <Select.Item key={connection.id} value={connection.id}>
              {connection.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
      {!pending && !list.length && first && (
        <p className="text-xs text-muted-foreground">
          <Link className="underline" to={paths.settings.integration(first)}>
            {t('connect', 'Connect it in Settings › Integrations')}
          </Link>
        </p>
      )}
    </div>
  );
};

const Toggle = ({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
}) => {
  const id = useId();

  return (
    <label htmlFor={id} className="flex items-center justify-between gap-4 text-sm">
      {label}
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
    </label>
  );
};

/** The services a portal signs in with, by the integration its connection is of. */
const SOCIAL = [
  { integration: 'google-sign-in', column: 'googleConnectionId', label: 'Google' },
  { integration: 'apple-sign-in', column: 'appleConnectionId', label: 'Apple' },
  { integration: 'facebook-login', column: 'facebookConnectionId', label: 'Facebook' },
] as const;

/** The addresses customers prove with a code. */
const CODES = [
  { column: 'emailSignIn', label: 'email' },
  { column: 'phoneSignIn', label: 'phone' },
] as const;

/** The integrations that text messages (CallPro, Twilio). */
const useSmsIntegrations = () =>
  (useQuery(orpc.integrations.list.queryOptions()).data?.data ?? [])
    .filter((integration) => integration.sms)
    .map((integration) => integration.key);

type PhoneDraft = Pick<SignIn, 'phoneConnectionId' | 'phoneTexts' | 'smsConnectionId'>;

/**
 * How phones prove themselves: the customer texts the code to verify.mn, it is texted to them
 * through an SMS connection, or both and the customer picks.
 */
const PhoneCodes = ({
  draft,
  disabled,
  onChange,
}: {
  draft: PhoneDraft;
  disabled: boolean;
  onChange: (phone: Partial<PhoneDraft>) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const sms = useSmsIntegrations();

  return (
    <Form.Section
      title={t('phone-codes', 'Phone codes')}
      description={t(
        'phone-codes-both',
        'Customers text the code to 144773 from their phone with verify.mn, and pay for the text, or erxes texts the code to them. With both on, the customer picks.',
      )}
    >
      <div className="space-y-3">
        <ConnectionSelect
          integrations={['verify-mn']}
          label={t('phone-verify', 'verify.mn')}
          offLabel={t('phone-verify-off', 'verify.mn · Off')}
          value={draft.phoneConnectionId}
          disabled={disabled}
          onChange={(phoneConnectionId) => onChange({ phoneConnectionId })}
        />
        <Toggle
          label={t('phone-texts', 'Text codes to customers')}
          checked={draft.phoneTexts}
          disabled={disabled}
          onChange={(phoneTexts) => onChange({ phoneTexts })}
        />
        {draft.phoneTexts && sms.length > 0 && (
          <ConnectionSelect
            integrations={sms}
            label={t('sms-connection', 'SMS connection')}
            offLabel={t('sms-default', 'The organisation’s first SMS connection')}
            value={draft.smsConnectionId}
            disabled={disabled}
            onChange={(smsConnectionId) => onChange({ smsConnectionId })}
          />
        )}
      </div>
    </Form.Section>
  );
};

/** How customers sign in to the portal: codes by email or phone, and Google, Apple or Facebook. */
export const PortalSignInForm = ({ portal, canEdit }: { portal: Portal; canEdit: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });
  const save = useSavePortal();
  const [draft, setDraft] = useState<SignIn>(() => ({ ...portal }));
  const off = t('off', 'Off');
  const disabled = !canEdit;

  return (
    <div className="space-y-4">
      <Form.Section
        title={t('codes', 'One-time codes')}
        description={t(
          'codes-description',
          'Customers prove an email or phone with a 6-digit code. Emails go out from the portal’s sender name.',
        )}
      >
        <div className="space-y-3">
          {CODES.map(({ column, label }) => (
            <Toggle
              key={column}
              label={label === 'email' ? t('email-sign-in', 'Email') : t('phone-sign-in', 'Phone')}
              checked={draft[column]}
              disabled={disabled}
              onChange={(checked) => setDraft({ ...draft, [column]: checked })}
            />
          ))}
        </div>
      </Form.Section>
      {draft.phoneSignIn && (
        <PhoneCodes
          draft={draft}
          disabled={disabled}
          onChange={(phone) => setDraft({ ...draft, ...phone })}
        />
      )}
      <Form.Section
        title={t('social', 'Google, Apple and Facebook')}
        description={t(
          'social-description',
          'The portal’s buttons get a token from the service’s own SDK; erxes checks it. The first sign-in joins the account with the same email, or makes one.',
        )}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {SOCIAL.map(({ integration, column, label }) => (
            <ConnectionSelect
              key={integration}
              integrations={[integration]}
              label={label}
              offLabel={`${label} · ${off}`}
              value={draft[column]}
              disabled={disabled}
              onChange={(connectionId) => setDraft({ ...draft, [column]: connectionId })}
            />
          ))}
        </div>
      </Form.Section>
      {canEdit && (
        <div className="flex justify-end">
          <Button
            disabled={save.isPending}
            onClick={() => save.mutate({ id: portal.id, ...draft })}
          >
            {save.isPending && <Spinner size="sm" />}
            {t('save', 'Save')}
          </Button>
        </div>
      )}
    </div>
  );
};
