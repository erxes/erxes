import {
  GatewayConfig,
  gatewayFields,
  gatewayTakes,
  PAYMENT_GATEWAYS,
  PaymentGatewayKind,
} from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Select, Spinner, Switch, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useSession } from '~/modules/auth/session';
import { GATEWAY_NAMES } from './gatewayNames';

type Kind = GatewayConfig['kind'];

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
};

/** The gateway kinds that take `currency` first; the rest still listed after them. */
const kindsFor = (currency: string) =>
  PaymentGatewayKind.options.toSorted(
    (a, b) => Number(gatewayTakes(b, currency)) - Number(gatewayTakes(a, currency)),
  );

/** A gateway kind with the currencies it takes, muted when it can't bill in the organisation's. */
const KindOption = ({ kind, currency }: { kind: Kind; currency: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const currencies = PAYMENT_GATEWAYS[kind].currencies.join(', ');

  const note = !currencies
    ? t('takes-any', 'Any currency')
    : gatewayTakes(kind, currency)
      ? t('takes', 'Takes {{currencies}}', { currencies })
      : t('takes-only', 'Takes {{currencies}} only', { currencies });

  return (
    <span className="flex items-baseline gap-2">
      <span className={gatewayTakes(kind, currency) ? '' : 'text-muted-foreground'}>
        {kind === 'test' ? t('test-gateway', 'Test (development)') : GATEWAY_NAMES[kind]}
      </span>
      <span className="text-xs text-muted-foreground">{note}</span>
    </span>
  );
};

const KindSelect = ({ value, onChange }: { value: Kind; onChange: (kind: Kind) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { currency } = useSession().organization;

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        const kind = PaymentGatewayKind.options.find((option) => option === next);

        if (kind) onChange(kind);
      }}
    >
      <Select.Trigger aria-label={t('kind', 'Gateway')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        {kindsFor(currency).map((kind) => (
          <Select.Item key={kind} value={kind}>
            <KindOption kind={kind} currency={currency} />
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

const useAddGateway = (onAdded: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();

  return useMutation(
    orpc.payments.addGateway.mutationOptions({
      onSuccess: () => {
        void client.invalidateQueries({ queryKey: orpc.payments.key() });
        onAdded();
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('add-failed', 'Could not connect'),
          description: messageOf(error),
        }),
    }),
  );
};

/** The kind's settings, from the contract: text, credentials (password inputs) and switches. */
const GatewayFields = ({
  kind,
  values,
  onChange,
}: {
  kind: Kind;
  values: Record<string, string | boolean>;
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
          value={typeof values[key] === 'string' ? values[key] : ''}
          onChange={(event) => onChange(key, event.target.value)}
        />
      </div>
    ),
  );
};

/** Mounted while the dialog is open, so closing it clears the credentials. */
const AddGatewayForm = ({ onAdded }: { onAdded: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();
  const { currency } = useSession().organization;
  const [first = 'qpay'] = kindsFor(currency);
  const [kind, setKind] = useState<Kind>(first);
  const [name, setName] = useState(GATEWAY_NAMES[first]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const add = useAddGateway(onAdded);

  // Empty text is left out, so a setting with a default takes it.
  const config = GatewayConfig.safeParse({
    kind,
    ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')),
  });

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t('kind', 'Gateway')}</Label>
        <KindSelect
          value={kind}
          onChange={(next) => {
            setKind(next);
            setName(GATEWAY_NAMES[next]);
            setValues({});
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      <GatewayFields
        kind={kind}
        values={values}
        onChange={(key, value) => setValues({ ...values, [key]: value })}
      />
      <Button
        className="w-full"
        disabled={add.isPending || !name || !config.success}
        onClick={() => {
          if (config.success) add.mutate({ name, config: config.data });
        }}
      >
        {add.isPending ? <Spinner size="sm" /> : t('connect', 'Connect')}
      </Button>
    </div>
  );
};

export const AddGateway = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={<Button />}>
        <IconPlus />
        {t('add', 'Connect a gateway')}
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined
          title={t('add', 'Connect a gateway')}
          description={t(
            'add-description',
            'Credentials are checked with the gateway and stored encrypted.',
          )}
        />
        {open && <AddGatewayForm onAdded={() => setOpen(false)} />}
      </Dialog.Content>
    </Dialog>
  );
};
