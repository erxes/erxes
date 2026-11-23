import type { Portal } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { useQuery } from '@tanstack/react-query';
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
  | 'googleConnectionId'
  | 'appleConnectionId'
  | 'facebookConnectionId'
>;

/** Off, or one of the organisation's connections of the integration (Settings › Integrations). */
const ConnectionSelect = ({
  integration,
  label,
  offLabel,
  value,
  onChange,
  disabled,
}: {
  integration: string;
  label: string;
  offLabel: string;
  value: string | null;
  onChange: (value: string | null) => void;
  disabled: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'portals' });

  const connections = useQuery(
    orpc.integrations.connections.queryOptions({ input: { key: integration } }),
  );

  const list = (connections.data?.data ?? []).filter(
    (connection) => connection.status === 'active' || connection.id === value,
  );

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
      {!connections.isPending && !list.length && (
        <p className="text-xs text-muted-foreground">
          <Link className="underline" to={paths.settings.integration(integration)}>
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
        <Form.Section
          title={t('phone-codes', 'Phone codes')}
          description={t(
            'phone-codes-description',
            'With verify.mn customers text the code to 144773 from their phone, and pay for the text. Off: erxes texts the code to them.',
          )}
        >
          <ConnectionSelect
            integration="verify-mn"
            label={t('phone-codes', 'Phone codes')}
            offLabel={t('phone-texted', 'Texted to the customer')}
            value={draft.phoneConnectionId}
            disabled={disabled}
            onChange={(phoneConnectionId) => setDraft({ ...draft, phoneConnectionId })}
          />
        </Form.Section>
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
              integration={integration}
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
