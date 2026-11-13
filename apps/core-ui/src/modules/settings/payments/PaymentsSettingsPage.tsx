import { type Invoice, InvoiceStatus } from '@erxes/core-contract';
import { IconCash } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Badge, PageContainer, PageHeader, ScrollArea, Select } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { orpc } from '~/lib/api';
import { useMoney } from '~/lib/money';
import { useCan, useSession } from '~/modules/auth/session';
import { AddGateway } from './AddGateway';
import { GatewayList, NoGateways, PluginGatewaySettings } from './Gateways';
import { InvoiceDetails } from './InvoiceDetails';
import { STATUS_BADGE } from './invoiceStatus';

type StatusFilter = Invoice['status'] | 'all';

const InvoiceRow = ({ invoice, onOpen }: { invoice: Invoice; onOpen: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const money = useMoney();

  return (
    <li>
      <button
        type="button"
        className="flex w-full items-center gap-3 p-3 text-left hover:bg-muted/50"
        onClick={onOpen}
      >
        <Badge variant={STATUS_BADGE[invoice.status]}>
          {t(`status.${invoice.status}`, invoice.status)}
        </Badge>
        <span className="font-medium">{money(invoice.amount, invoice.currency)}</span>
        {invoice.refundedAmount > 0 && invoice.status !== 'refunded' && (
          <span className="text-xs text-muted-foreground">
            {t('partly-refunded', '−{{amount}} refunded', {
              amount: money(invoice.refundedAmount, invoice.currency),
            })}
          </span>
        )}
        <span className="truncate">{invoice.description}</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {invoice.source} · {invoice.reference.type} {invoice.reference.id}
        </span>
      </button>
    </li>
  );
};

const StatusSelect = ({
  value,
  onChange,
}: {
  value: StatusFilter;
  onChange: (status: StatusFilter) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });

  return (
    <Select
      value={value}
      onValueChange={(next) =>
        onChange(InvoiceStatus.options.find((option) => option === next) ?? 'all')
      }
    >
      <Select.Trigger aria-label={t('status-label', 'Status')}>
        <Select.Value />
      </Select.Trigger>
      <Select.Content>
        <Select.Item value="all">{t('status-all', 'All statuses')}</Select.Item>
        {InvoiceStatus.options.map((item) => (
          <Select.Item key={item} value={item}>
            {t(`status.${item}`, item)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};

/** The latest invoices; one opens with its refunds. */
const Invoices = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const [status, setStatus] = useState<StatusFilter>('all');
  const [open, setOpen] = useState<Invoice | null>(null);

  const invoices = useQuery(
    orpc.payments.invoices.queryOptions({
      input: { limit: 50, ...(status === 'all' ? {} : { status }) },
    }),
  );

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium">{t('invoices', 'Recent invoices')}</h2>
        <div className="ml-auto w-40">
          <StatusSelect value={status} onChange={setStatus} />
        </div>
      </div>
      <QueryState
        query={invoices}
        isEmpty={({ data }) => !data.length}
        empty={
          <p className="text-sm text-muted-foreground">{t('no-invoices', 'No invoices yet.')}</p>
        }
      >
        {({ data }) => (
          <ul className="divide-y rounded-lg border text-sm">
            {data.map((invoice) => (
              <InvoiceRow key={invoice.id} invoice={invoice} onOpen={() => setOpen(invoice)} />
            ))}
          </ul>
        )}
      </QueryState>
      {open && <InvoiceDetails invoice={open} onClose={() => setOpen(null)} />}
    </section>
  );
};

/** The organisation's currency, which new invoices take, and where to change it. */
const CurrencyNote = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { currency } = useSession().organization;

  return (
    <p className="text-sm text-muted-foreground">
      {t('currency-note', 'New invoices are in {{currency}} unless a plugin names another.', {
        currency,
      })}{' '}
      <Link to="/settings/general" className="text-primary hover:underline">
        {t('change-currency', 'Change')}
      </Link>
    </p>
  );
};

/** Settings › Payments: gateway connections, and invoices plugins made through them. */
export const PaymentsSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const canManage = useCan()('payments.manage');
  const gateways = useQuery(orpc.payments.gateways.queryOptions({ enabled: canManage }));

  if (!canManage) return <Navigate to="/settings" replace />;

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Payments'), to: '/settings/payments', icon: IconCash }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <AddGateway />
        </PageHeader.End>
      </PageHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl space-y-8 p-6">
          <CurrencyNote />
          <QueryState
            query={gateways}
            isEmpty={({ data }) => !data.length}
            empty={
              <section className="space-y-2">
                <h2 className="text-sm font-medium">{t('gateways', 'Gateways')}</h2>
                <NoGateways />
              </section>
            }
          >
            {({ data }) => (
              <>
                <section className="space-y-2">
                  <h2 className="text-sm font-medium">{t('gateways', 'Gateways')}</h2>
                  <GatewayList gateways={data} />
                </section>
                <PluginGatewaySettings gateways={data} />
              </>
            )}
          </QueryState>
          <Invoices />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
