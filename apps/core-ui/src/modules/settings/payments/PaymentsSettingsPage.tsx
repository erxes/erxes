import type { GatewayConfig, Invoice } from '@erxes/core-contract';
import { IconCash, IconPlus } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Dialog, Empty, Input, Label, PageContainer, ScrollArea, Select, Spinner, Switch, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

const money = (invoice: Pick<Invoice, 'amount' | 'currency'>) =>
  `${(invoice.amount / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${invoice.currency === 'MNT' ? '₮' : invoice.currency}`;

const STATUS = { pending: 'warning', paid: 'success', cancelled: 'secondary', expired: 'secondary', failed: 'destructive' } as const;

const AddGateway = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<'qpay' | 'test'>('qpay');
  const [name, setName] = useState('QPay');
  const [qpay, setQpay] = useState({ clientId: '', clientSecret: '', invoiceCode: '', sandbox: false });
  const add = useMutation({
    mutationFn: () => {
      const config: GatewayConfig = kind === 'qpay' ? { kind, ...qpay } : { kind: 'test' };

      return api.payments.addGateway({ name, config });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ['payments'] });
      setOpen(false);
    },
    onError: (error) => toast({ variant: 'destructive', title: t('add-failed', 'Could not connect'), description: messageOf(error) }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add', 'Connect a gateway')}
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.HeaderCombined title={t('add', 'Connect a gateway')} description={t('add-description', 'Credentials are checked with the gateway and stored encrypted.')} />
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>{t('kind', 'Gateway')}</Label>
            <Select
              value={kind}
              onValueChange={(value) => {
                setKind(value as 'qpay' | 'test');
                setName(value === 'qpay' ? 'QPay' : 'Test');
              }}
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="qpay">QPay</Select.Item>
                <Select.Item value="test">{t('test-gateway', 'Test (development)')}</Select.Item>
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{t('name', 'Name')}</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          {kind === 'qpay' && (
            <>
              {(['clientId', 'clientSecret', 'invoiceCode'] as const).map((key) => (
                <div key={key} className="space-y-1.5">
                  <Label>{t(`qpay-${key}`, key === 'clientId' ? 'Client ID' : key === 'clientSecret' ? 'Client secret' : 'Invoice code')}</Label>
                  <Input
                    type={key === 'clientSecret' ? 'password' : 'text'}
                    value={qpay[key]}
                    onChange={(event) => setQpay({ ...qpay, [key]: event.target.value })}
                  />
                </div>
              ))}
              <label className="flex items-center gap-2 text-sm">
                <Switch checked={qpay.sandbox} onCheckedChange={(sandbox) => setQpay({ ...qpay, sandbox })} />
                {t('sandbox', 'Sandbox (merchant-sandbox.qpay.mn)')}
              </label>
            </>
          )}
          <Button
            className="w-full"
            disabled={add.isPending || !name || (kind === 'qpay' && (!qpay.clientId || !qpay.clientSecret || !qpay.invoiceCode))}
            onClick={() => add.mutate()}
          >
            {add.isPending ? <Spinner size="sm" /> : t('connect', 'Connect')}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

/** Settings › Payments: gateway connections, and invoices plugins made through them. */
export const PaymentsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const can = useCan();
  const client = useQueryClient();
  const gateways = useQuery({ queryKey: ['payments', 'gateways'], queryFn: () => api.payments.gateways(), enabled: can('payments.manage') });
  const invoices = useQuery({ queryKey: ['payments', 'invoices'], queryFn: () => api.payments.invoices({ limit: 50 }), enabled: can('payments.manage') });
  const toggle = useMutation({
    mutationFn: (gateway: { id: string; status: 'active' | 'disabled' }) =>
      api.payments.updateGateway({ id: gateway.id, status: gateway.status === 'active' ? 'disabled' : 'active' }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['payments'] }),
  });

  if (!can('payments.manage')) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Payments'), to: '/settings/payments', icon: IconCash }]} />
        </PageHeader.Start>
        <PageHeader.End>
          <AddGateway />
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-8 p-6">
          <section className="space-y-2">
            <h2 className="text-sm font-medium">{t('gateways', 'Gateways')}</h2>
            {gateways.isLoading ? (
              <Spinner />
            ) : !gateways.data?.data.length ? (
              <Empty className="py-10">
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <IconCash />
                  </Empty.Media>
                  <Empty.Title>{t('empty', 'No gateway yet')}</Empty.Title>
                  <Empty.Description>{t('empty-description', 'Connect QPay so plugins can take payments for orders, bookings and more.')}</Empty.Description>
                </Empty.Header>
              </Empty>
            ) : (
              <ul className="divide-y rounded-lg border">
                {gateways.data.data.map((gateway) => (
                  <li key={gateway.id} className="flex items-center gap-3 p-3">
                    <span className="font-medium">{gateway.name}</span>
                    <Badge variant="secondary">{gateway.kind}</Badge>
                    {gateway.settings.sandbox === true && <Badge variant="warning">{t('sandbox-badge', 'sandbox')}</Badge>}
                    <span className="text-xs text-muted-foreground">{String(gateway.settings.invoiceCode ?? '')}</span>
                    <Button className="ml-auto" size="sm" variant="outline" onClick={() => toggle.mutate(gateway)}>
                      {gateway.status === 'active' ? t('turn-off', 'Turn off') : t('turn-on', 'Turn on')}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="space-y-2">
            <h2 className="text-sm font-medium">{t('invoices', 'Recent invoices')}</h2>
            {invoices.isLoading ? (
              <Spinner />
            ) : !invoices.data?.data.length ? (
              <p className="text-sm text-muted-foreground">{t('no-invoices', 'No invoices yet.')}</p>
            ) : (
              <ul className="divide-y rounded-lg border text-sm">
                {invoices.data.data.map((invoice) => (
                  <li key={invoice.id} className="flex items-center gap-3 p-3">
                    <Badge variant={STATUS[invoice.status]}>{t(`status.${invoice.status}`, invoice.status)}</Badge>
                    <span className="font-medium">{money(invoice)}</span>
                    <span className="truncate">{invoice.description}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {invoice.source} · {invoice.reference.type} {invoice.reference.id}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
