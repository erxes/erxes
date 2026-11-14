import {
  type GatewayConfig,
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

type Kind = GatewayConfig['kind'];

const QPAY_FIELDS = [
  { key: 'clientId', label: 'Client ID', type: 'text' },
  { key: 'clientSecret', label: 'Client secret', type: 'password' },
  { key: 'invoiceCode', label: 'Invoice code', type: 'text' },
] as const;

/** A new connection's name until it's changed. */
const DEFAULT_NAME: Record<Kind, string> = { qpay: 'QPay', test: 'Test' };

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
        {kind === 'qpay' ? 'QPay' : t('test-gateway', 'Test (development)')}
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

/** Mounted while the dialog is open, so closing it clears the credentials. */
const AddGatewayForm = ({ onAdded }: { onAdded: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();
  const { currency } = useSession().organization;
  const [first = 'qpay'] = kindsFor(currency);
  const [kind, setKind] = useState<Kind>(first);
  const [name, setName] = useState(DEFAULT_NAME[first]);

  const [qpay, setQpay] = useState({
    clientId: '',
    clientSecret: '',
    invoiceCode: '',
    sandbox: false,
  });

  const add = useAddGateway(onAdded);
  const config: GatewayConfig = kind === 'qpay' ? { kind, ...qpay } : { kind };
  const incomplete = kind === 'qpay' && QPAY_FIELDS.some(({ key }) => !qpay[key]);

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>{t('kind', 'Gateway')}</Label>
        <KindSelect
          value={kind}
          onChange={(next) => {
            setKind(next);
            setName(DEFAULT_NAME[next]);
          }}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-name`}>{t('name', 'Name')}</Label>
        <Input id={`${id}-name`} value={name} onChange={(event) => setName(event.target.value)} />
      </div>
      {kind === 'qpay' && (
        <>
          {QPAY_FIELDS.map(({ key, label, type }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={`${id}-${key}`}>{t(`qpay-${key}`, label)}</Label>
              <Input
                id={`${id}-${key}`}
                type={type}
                value={qpay[key]}
                onChange={(event) => setQpay({ ...qpay, [key]: event.target.value })}
              />
            </div>
          ))}
          <div className="flex items-center gap-2 text-sm">
            <Switch
              id={`${id}-sandbox`}
              checked={qpay.sandbox}
              onCheckedChange={(sandbox) => setQpay({ ...qpay, sandbox })}
            />
            <Label htmlFor={`${id}-sandbox`} variant="option">
              {t('sandbox', 'Sandbox (merchant-sandbox.qpay.mn)')}
            </Label>
          </div>
        </>
      )}
      <Button
        className="w-full"
        disabled={add.isPending || !name || incomplete}
        onClick={() => add.mutate({ name, config })}
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
