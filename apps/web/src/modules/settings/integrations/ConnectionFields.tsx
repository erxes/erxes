import type { IntegrationConnection } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconExternalLink, IconLock } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Input, Label, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BankLinkedChoice,
  isBankLinkedChoice,
  isHiddenBankField,
  waitsForConnection,
} from './BankLinkedChoices';
import type { Integration } from './catalog';
import { ChoiceSelect } from './ChoiceSelect';
import { useIntegrationText } from './IntegrationStatusBadge';
import { isQuickQrChoice, isQuickQrName, QuickQrChoice, quickQrHides } from './QuickQrChoices';

export type ConnectionValues = Record<string, string | boolean>;

export const connectionKeys = (integration: Integration, values: ConnectionValues) => ({
  keys: Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
  ready: integration.fields.every(
    ({ key, type, optional }) =>
      optional ||
      type === 'switch' ||
      (typeof values[key] === 'string' && values[key].trim() !== ''),
  ),
});

export const settingsFilled = (integration: Integration, values: ConnectionValues) =>
  integration.fields.every(
    ({ key, type, optional }) =>
      optional ||
      type === 'switch' ||
      type === 'secret' ||
      (typeof values[key] === 'string' && values[key].trim() !== ''),
  );

export const changedKeys = (kept: ConnectionValues, typed: ConnectionValues) =>
  Object.fromEntries(
    Object.entries(typed).flatMap(([key, value]) => {
      if (value === (kept[key] ?? '')) return [];

      return [[key, value === '' ? null : value]];
    }),
  );

export const shownValues = (connection: IntegrationConnection): ConnectionValues =>
  Object.fromEntries(
    Object.entries(connection.settings).filter(
      (entry): entry is [string, string | boolean] =>
        typeof entry[1] === 'string' || typeof entry[1] === 'boolean',
    ),
  );

export const useConnectionsChanged = () => {
  const client = useQueryClient();

  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.integrations.key() }),
      client.invalidateQueries({ queryKey: orpc.payments.key() }),
      // A bank connection is what transfer payments pick as their config.
      client.invalidateQueries({ queryKey: orpc.banks.key() }),
      client.invalidateQueries({ queryKey: orpc.assistant.providers.key() }),
      client.invalidateQueries({ queryKey: orpc.assistant.models.key() }),
      client.invalidateQueries({ queryKey: orpc.automations.decisionModels.key() }),
    ]);
};

export const CredentialsHelp = ({ integration }: { integration: Integration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { name } = useIntegrationText()(integration);
  const { dashboard } = integration;

  // None of its own to copy: a payment that reads through a bank uses the bank connection's.
  if (!integration.fields.some((field) => field.type === 'secret')) return null;

  return (
    <p className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
      <IconLock className="mt-px size-3.5 shrink-0" />
      <span>
        {dashboard && t('help-dashboard', 'Copy these from your {{name}} dashboard.', { name })}
        {/* Gateways with no dashboard hand their keys over with the merchant agreement. */}
        {!dashboard &&
          integration.category === 'payments' &&
          t('help-agreement', '{{name}} sends these when you sign the merchant agreement.', {
            name,
          })}{' '}
        {t('help-sealed', 'They are checked with the service and stored encrypted.')}{' '}
        {dashboard && (
          <a
            href={dashboard}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-primary-text underline"
          >
            {t('open-dashboard', 'Open dashboard')}
            <IconExternalLink className="size-3" />
          </a>
        )}
      </span>
    </p>
  );
};

/** A field's input: a picker where the value comes from a list, a password box for a secret. */
const FieldInput = ({
  id,
  integration,
  field,
  values,
  secretsKept,
  onChange,
}: {
  id: string;
  integration: Integration;
  field: Integration['fields'][number];
  values: ConnectionValues;
  secretsKept: boolean;
  onChange: (key: string, value: string | boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { key, type, options = [] } = field;
  const text = typeof values[key] === 'string' ? values[key] : '';

  if (isBankLinkedChoice(integration.key, key))
    return (
      <BankLinkedChoice
        id={id}
        kind={integration.key}
        field={key}
        values={values}
        onChange={onChange}
      />
    );

  if (integration.key === 'quickqr' && isQuickQrChoice(key))
    return <QuickQrChoice id={id} field={key} values={values} onChange={onChange} />;

  if (type === 'select')
    return (
      <ChoiceSelect
        id={id}
        value={text}
        placeholder={t('choose', 'Choose')}
        choices={options.map((option) => ({ value: option, label: t(`option.${option}`, option) }))}
        onChange={(value) => onChange(key, value)}
      />
    );

  return (
    <Input
      id={id}
      type={type === 'secret' ? 'password' : 'text'}
      autoComplete="off"
      spellCheck={false}
      placeholder={
        type === 'secret' && secretsKept ? t('secret-kept', 'Kept. Type to replace it') : undefined
      }
      value={text}
      onChange={(event) => onChange(key, event.target.value)}
    />
  );
};

/**
 * What a connection asks for. Fields core fills (`hidden`, a transfer
 * payment's IBAN and account name) aren't shown; a transfer payment's account
 * waits for its config, as in 3.x.
 */
export const ConnectionFieldInputs = ({
  integration,
  values,
  secretsKept = false,
  onChange,
}: {
  integration: Integration;
  values: ConnectionValues;
  secretsKept?: boolean;
  onChange: (key: string, value: string | boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const id = useId();

  const shown = integration.fields.filter(
    ({ key, type }) =>
      type !== 'hidden' &&
      !isHiddenBankField(integration.key, key) &&
      !(integration.key === 'quickqr' && quickQrHides(key, values)) &&
      (key === 'connectionId' || !waitsForConnection(integration.key, values)),
  );

  return shown.map((field) =>
    field.type === 'switch' ? (
      <div key={field.key} className="flex items-center gap-2 text-sm">
        <Switch
          id={`${id}-${field.key}`}
          checked={values[field.key] === true}
          onCheckedChange={(on) => onChange(field.key, on)}
        />
        <Label htmlFor={`${id}-${field.key}`} variant="option">
          {t(`field.${field.key}`, field.label)}
        </Label>
      </div>
    ) : (
      <div key={field.key} className="space-y-1.5">
        <Label htmlFor={`${id}-${field.key}`}>
          {t(`field.${field.key}`, field.label)}
          {field.optional && !(integration.key === 'quickqr' && isQuickQrName(field.key)) && (
            <span className="text-muted-foreground"> {t('optional', '(optional)')}</span>
          )}
        </Label>
        <FieldInput
          id={`${id}-${field.key}`}
          integration={integration}
          field={field}
          values={values}
          secretsKept={secretsKept}
          onChange={onChange}
        />
        {integration.key === 'quickqr' && field.key === 'iban' && (
          <p className="text-xs text-muted-foreground">
            {t(
              'quickqr-iban-hint',
              'The IBAN’s digits between MN and the account number: 75000500 at Khan Bank.',
            )}
          </p>
        )}
      </div>
    ),
  );
};
