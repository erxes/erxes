import { type GatewayConfig, PaymentGatewayKind } from '@erxes/core-contract';
import { IconPlus } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Dialog, Input, Label, Select, Spinner, Switch, useToast } from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

type Kind = GatewayConfig['kind'];

const QPAY_FIELDS = [
  { key: 'clientId', label: 'Client ID', type: 'text' },
  { key: 'clientSecret', label: 'Client secret', type: 'password' },
  { key: 'invoiceCode', label: 'Invoice code', type: 'text' },
] as const;

const KindSelect = ({ value, onChange }: { value: Kind; onChange: (kind: Kind) => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });

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
        <Select.Item value="qpay">QPay</Select.Item>
        <Select.Item value="test">{t('test-gateway', 'Test (development)')}</Select.Item>
      </Select.Content>
    </Select>
  );
};

/** Mounted while the dialog is open, so closing it clears the credentials. */
const AddGatewayForm = ({ onAdded }: { onAdded: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();
  const id = useId();
  const [kind, setKind] = useState<Kind>('qpay');
  const [name, setName] = useState('QPay');

  const [qpay, setQpay] = useState({
    clientId: '',
    clientSecret: '',
    invoiceCode: '',
    sandbox: false,
  });

  const add = useMutation(
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
            setName(next === 'qpay' ? 'QPay' : 'Test');
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
            <Label htmlFor={`${id}-sandbox`} className="font-normal">
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
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add', 'Connect a gateway')}
        </Button>
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
