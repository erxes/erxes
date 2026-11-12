import type { GatewayConfig, Invoice, PaymentGateway, PluginPaymentSettings } from '@erxes/core-contract';
import { IconCash, IconPlug, IconPlus, IconReceiptRefund } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Checkbox,
  Dialog,
  Empty,
  Input,
  Label,
  PageContainer,
  RelativeDateDisplay,
  ScrollArea,
  Select,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { useCan } from '~/modules/auth/session';

const money = (amount: number, currency = 'MNT') =>
  `${(amount / 100).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency === 'MNT' ? '₮' : currency}`;

const STATUS = { pending: 'warning', paid: 'success', refunded: 'secondary', cancelled: 'secondary', expired: 'secondary', failed: 'destructive' } as const;
const STATUSES = Object.keys(STATUS) as Invoice['status'][];

/** One invoice: what was paid, its metadata and refunds, and a refund form for those allowed. */
const InvoiceDetails = ({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const can = useCan();
  const { toast } = useToast();
  const client = useQueryClient();
  const refunds = useQuery({ queryKey: ['payments', 'refunds', invoice.id], queryFn: () => api.payments.refunds({ id: invoice.id }) });
  const left = invoice.refundable.amount;
  // A gateway that refunds whole payments only can't take part of it: record those as manual.
  const gatewayCanPartial = invoice.refundable.gateway === 'partial';
  const [amount, setAmount] = useState(String(left / 100));
  const [reason, setReason] = useState('');
  const [manual, setManual] = useState(invoice.refundable.gateway === 'none' || (invoice.refundable.gateway === 'full' && invoice.refundedAmount > 0));
  const cents = Math.round(Number(amount) * 100);
  const mustBeManual = !manual && !gatewayCanPartial && cents !== left;
  const refund = useMutation({
    mutationFn: () => api.payments.refund({ id: invoice.id, amount: cents, reason, manual }),
    onSuccess: (result) => {
      void client.invalidateQueries({ queryKey: ['payments'] });

      if (result.refund.status === 'failed') {
        toast({ variant: 'destructive', title: t('refund-refused', 'The gateway refused the refund'), description: result.refund.error ?? undefined });
        return;
      }

      toast({ title: t('refunded', 'Refunded {{amount}}', { amount: money(result.refund.amount, invoice.currency) }) });
      onClose();
    },
    onError: (error) => toast({ variant: 'destructive', title: t('refund-failed', 'Could not refund'), description: messageOf(error) }),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="max-w-lg">
        <Dialog.HeaderCombined title={invoice.description} description={`${invoice.source} · ${invoice.reference.type} ${invoice.reference.id}`} />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t('amount', 'Amount')}</dt>
          <dd>{money(invoice.amount, invoice.currency)}</dd>
          <dt className="text-muted-foreground">{t('paid', 'Paid')}</dt>
          <dd>{invoice.paidAmount === null ? '—' : money(invoice.paidAmount, invoice.currency)}</dd>
          <dt className="text-muted-foreground">{t('refunded-total', 'Refunded')}</dt>
          <dd>{money(invoice.refundedAmount, invoice.currency)}</dd>
          <dt className="text-muted-foreground">{t('status-label', 'Status')}</dt>
          <dd>
            <Badge variant={STATUS[invoice.status]}>{t(`status.${invoice.status}`, invoice.status)}</Badge>
          </dd>
        </dl>
        {Object.keys(invoice.metadata).length > 0 && (
          <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">{JSON.stringify(invoice.metadata, null, 2)}</pre>
        )}
        {!!refunds.data?.data.length && (
          <ul className="divide-y rounded-lg border text-sm">
            {refunds.data.data.map((item) => (
              <li key={item.id} className="flex items-center gap-2 p-2">
                <Badge variant={item.status === 'succeeded' ? 'success' : 'destructive'}>{t(`refund-status.${item.status}`, item.status)}</Badge>
                <span className="font-medium">{money(item.amount, invoice.currency)}</span>
                <span className="truncate text-muted-foreground">{item.error ?? item.reason}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.method === 'manual' ? t('manual', 'manual') : t('via-gateway', 'gateway')} ·{' '}
                  <RelativeDateDisplay value={item.createdAt} asChild>
                    <span>
                      <RelativeDateDisplay.Value value={item.createdAt} />
                    </span>
                  </RelativeDateDisplay>
                </span>
              </li>
            ))}
          </ul>
        )}
        {can('payments.refund') && left > 0 && (
          <div className="space-y-3 border-t pt-3">
            <h3 className="flex items-center gap-2 text-sm font-medium">
              <IconReceiptRefund className="size-4" />
              {t('refund', 'Refund')}
            </h3>
            <div className="space-y-1.5">
              <Label>{t('refund-amount', 'Amount (up to {{left}})', { left: money(left, invoice.currency) })}</Label>
              <Input type="number" min={0.01} step={0.01} value={amount} onChange={(event) => setAmount(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('refund-reason', 'Reason')}</Label>
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={2} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={manual} onCheckedChange={setManual} disabled={invoice.refundable.gateway === 'none'} />
              {t('refund-manual', 'Already paid back outside erxes (record only)')}
            </label>
            {mustBeManual && (
              <p className="text-xs text-destructive">
                {t('refund-full-only', 'This gateway refunds whole payments only. Refund part of it outside erxes and record it.')}
              </p>
            )}
            <Button
              className="w-full"
              variant="destructive"
              disabled={refund.isPending || !reason.trim() || !(cents > 0 && cents <= left) || mustBeManual}
              onClick={() => refund.mutate()}
            >
              {refund.isPending ? <Spinner size="sm" /> : t('refund-confirm', 'Refund {{amount}}', { amount: money(cents || 0, invoice.currency) })}
            </Button>
          </div>
        )}
      </Dialog.Content>
    </Dialog>
  );
};

/** Which gateway each payment-taking plugin uses, and which it may use. */
const PluginSettingsRow = ({ settings, gateways }: { settings: PluginPaymentSettings; gateways: PaymentGateway[] }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();
  const save = useMutation({
    mutationFn: (next: Pick<PluginPaymentSettings, 'defaultGatewayId' | 'allowedGatewayIds'>) =>
      api.payments.updatePluginSettings({ plugin: settings.plugin, ...next }),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['payments', 'plugins'] }),
    onError: (error) => toast({ variant: 'destructive', title: t('save-failed', 'Could not save'), description: messageOf(error) }),
  });
  const allowed = settings.allowedGatewayIds;
  const toggleAllowed = (id: string, on: boolean) => {
    const next = on ? [...allowed, id] : allowed.filter((item) => item !== id);
    const defaultGatewayId = settings.defaultGatewayId && next.length && !next.includes(settings.defaultGatewayId) ? null : settings.defaultGatewayId;

    save.mutate({ allowedGatewayIds: next, defaultGatewayId });
  };

  return (
    <li className="space-y-2 p-3 text-sm">
      <div className="flex items-center gap-3">
        <IconPlug className="size-4 text-muted-foreground" />
        <span className="font-medium">{settings.title}</span>
        <div className="ml-auto w-56">
          <Select
            value={settings.defaultGatewayId ?? 'auto'}
            onValueChange={(value) => save.mutate({ allowedGatewayIds: allowed, defaultGatewayId: value === 'auto' ? null : value })}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="auto">{t('default-auto', 'Default: first active gateway')}</Select.Item>
              {gateways
                .filter((gateway) => !allowed.length || allowed.includes(gateway.id))
                .map((gateway) => (
                  <Select.Item key={gateway.id} value={gateway.id}>
                    {t('default-gateway', 'Default: {{name}}', { name: gateway.name })}
                  </Select.Item>
                ))}
            </Select.Content>
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 pl-7 text-xs text-muted-foreground">
        <span>{allowed.length ? t('allowed-some', 'May use:') : t('allowed-all', 'May use any gateway; limit to:')}</span>
        {gateways.map((gateway) => (
          <label key={gateway.id} className="flex items-center gap-1.5">
            <Checkbox checked={allowed.includes(gateway.id)} onCheckedChange={(on) => toggleAllowed(gateway.id, on === true)} />
            {gateway.name}
          </label>
        ))}
      </div>
    </li>
  );
};

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
  const [status, setStatus] = useState<Invoice['status'] | 'all'>('all');
  const [open, setOpen] = useState<Invoice | null>(null);
  const invoices = useQuery({
    queryKey: ['payments', 'invoices', status],
    queryFn: () => api.payments.invoices({ limit: 50, ...(status === 'all' ? {} : { status }) }),
    enabled: can('payments.manage'),
  });
  const pluginSettings = useQuery({ queryKey: ['payments', 'plugins'], queryFn: () => api.payments.pluginSettings(), enabled: can('payments.manage') });
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
          {!!pluginSettings.data?.data.length && !!gateways.data?.data.length && (
            <section className="space-y-2">
              <h2 className="text-sm font-medium">{t('plugins', 'Plugins taking payments')}</h2>
              <ul className="divide-y rounded-lg border">
                {pluginSettings.data.data.map((settings) => (
                  <PluginSettingsRow key={settings.plugin} settings={settings} gateways={gateways.data.data} />
                ))}
              </ul>
            </section>
          )}
          <section className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium">{t('invoices', 'Recent invoices')}</h2>
              <div className="ml-auto w-40">
                <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="all">{t('status-all', 'All statuses')}</Select.Item>
                    {STATUSES.map((item) => (
                      <Select.Item key={item} value={item}>
                        {t(`status.${item}`, item)}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </div>
            </div>
            {invoices.isLoading ? (
              <Spinner />
            ) : !invoices.data?.data.length ? (
              <p className="text-sm text-muted-foreground">{t('no-invoices', 'No invoices yet.')}</p>
            ) : (
              <ul className="divide-y rounded-lg border text-sm">
                {invoices.data.data.map((invoice) => (
                  <li key={invoice.id} className="flex cursor-pointer items-center gap-3 p-3 hover:bg-muted/50" onClick={() => setOpen(invoice)}>
                    <Badge variant={STATUS[invoice.status]}>{t(`status.${invoice.status}`, invoice.status)}</Badge>
                    <span className="font-medium">{money(invoice.amount, invoice.currency)}</span>
                    {invoice.refundedAmount > 0 && invoice.status !== 'refunded' && (
                      <span className="text-xs text-muted-foreground">
                        {t('partly-refunded', '−{{amount}} refunded', { amount: money(invoice.refundedAmount, invoice.currency) })}
                      </span>
                    )}
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
      {open && <InvoiceDetails invoice={open} onClose={() => setOpen(null)} />}
    </PageContainer>
  );
};
