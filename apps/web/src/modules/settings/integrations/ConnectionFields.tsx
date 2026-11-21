import type { IntegrationConnection } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconExternalLink, IconLock } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Input, Label, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { CoreIntegration } from './catalog';
import { useIntegrationText } from './IntegrationStatusBadge';

export type ConnectionValues = Record<string, string | boolean>;

export const connectionKeys = (integration: CoreIntegration, values: ConnectionValues) => ({
  keys: Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
  ready: integration.fields.every(
    ({ key, type, optional }) =>
      optional ||
      type === 'switch' ||
      (typeof values[key] === 'string' && values[key].trim() !== ''),
  ),
});

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
    ]);
};

export const CredentialsHelp = ({ integration }: { integration: CoreIntegration }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const { name } = useIntegrationText()(integration);
  const { dashboard } = integration;

  if (!integration.fields.length) return null;

  return (
    <p className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
      <IconLock className="mt-px size-3.5 shrink-0" />
      <span>
        {dashboard
          ? t('help-dashboard', 'Copy these from your {{name}} dashboard.', { name })
          : t('help-agreement', '{{name}} sends these when you sign the merchant agreement.', {
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

export const ConnectionFieldInputs = ({
  integration,
  values,
  onChange,
}: {
  integration: CoreIntegration;
  values: ConnectionValues;
  onChange: (key: string, value: string | boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const id = useId();

  return integration.fields.map(({ key, label, type, optional }) =>
    type === 'switch' ? (
      <div key={key} className="flex items-center gap-2 text-sm">
        <Switch
          id={`${id}-${key}`}
          checked={values[key] === true}
          onCheckedChange={(on) => onChange(key, on)}
        />
        <Label htmlFor={`${id}-${key}`} variant="option">
          {t(`field.${key}`, label)}
        </Label>
      </div>
    ) : (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={`${id}-${key}`}>
          {t(`field.${key}`, label)}
          {optional && (
            <span className="text-muted-foreground"> {t('optional', '(optional)')}</span>
          )}
        </Label>
        <Input
          id={`${id}-${key}`}
          type={type === 'secret' ? 'password' : 'text'}
          autoComplete="off"
          spellCheck={false}
          value={typeof values[key] === 'string' ? values[key] : ''}
          onChange={(event) => onChange(key, event.target.value)}
        />
      </div>
    ),
  );
};
