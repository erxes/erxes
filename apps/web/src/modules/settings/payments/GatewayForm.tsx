import { GatewayConfig, gatewayFields, type PaymentGatewayKind } from '@erxes/core-contract';
import { IconExternalLink, IconLock } from '@tabler/icons-react';
import { Input, Label, Switch } from 'erxes-ui';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { GATEWAY_DASHBOARDS, GATEWAY_NAMES } from './gatewayCatalog';

export type GatewayValues = Record<string, string | boolean>;

/** What each setting is called on the gateway's merchant portal. */
const FIELD_LABELS: Record<string, string> = {
  clientId: 'Client ID',
  clientSecret: 'Client secret',
  invoiceCode: 'Invoice code',
  terminal: 'Terminal',
  terminalKey: 'Terminal key',
  username: 'Username',
  accountId: 'Account ID',
  storeId: 'Store ID',
  password: 'Password',
  appUsername: 'App username',
  appPassword: 'App password',
  terminalId: 'Terminal ID',
  merchantId: 'Merchant ID',
  checksumKey: 'Checksum key',
  token: 'Token',
  apiUrl: 'API address',
  entityId: 'Entity ID (client_id)',
  secretKey: 'Secret key',
  sandbox: 'Sandbox (test environment)',
  appId: 'App ID',
  mchId: 'Merchant ID (mchid)',
  serialNo: 'Certificate serial number',
  privateKey: 'API private key (apiclient_key.pem)',
  merchantCategoryCode: 'Merchant category code (MCC)',
};

/** The config the values make, if complete; empty text is left out, so a setting with a default takes it. */
export const gatewayConfigOf = (kind: PaymentGatewayKind, values: GatewayValues) =>
  GatewayConfig.safeParse({
    kind,
    ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
  });

/** Where the credentials come from: the gateway's dashboard, or its merchant agreement. */
export const CredentialsHelp = ({ kind }: { kind: PaymentGatewayKind }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const dashboard = GATEWAY_DASHBOARDS[kind];
  const name = GATEWAY_NAMES[kind];

  return (
    <p className="flex items-start gap-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground">
      <IconLock className="mt-px size-3.5 shrink-0" />
      <span>
        {kind === 'test'
          ? t('help-test', 'Invoices are paid from Settings › Payments. Nothing is charged.')
          : dashboard
            ? t('help-dashboard', 'Copy these from your {{name}} dashboard.', { name })
            : t('help-agreement', '{{name}} sends these when you sign the merchant agreement.', {
                name,
              })}{' '}
        {t('help-sealed', 'They are checked with the gateway and stored encrypted.')}{' '}
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

/** The kind's settings, from the contract: text, credentials (password inputs) and switches. */
export const GatewayFields = ({
  kind,
  values,
  onChange,
}: {
  kind: PaymentGatewayKind;
  values: GatewayValues;
  onChange: (key: string, value: string | boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();

  return gatewayFields(kind).map(({ key, type, optional }) =>
    type === 'switch' ? (
      <div key={key} className="flex items-center gap-2 text-sm">
        <Switch
          id={`${id}-${key}`}
          checked={values[key] === true}
          onCheckedChange={(on) => onChange(key, on)}
        />
        <Label htmlFor={`${id}-${key}`} variant="option">
          {t(`field-${key}`, FIELD_LABELS[key] ?? key)}
        </Label>
      </div>
    ) : (
      <div key={key} className="space-y-1.5">
        <Label htmlFor={`${id}-${key}`}>
          {t(`field-${key}`, FIELD_LABELS[key] ?? key)}
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
