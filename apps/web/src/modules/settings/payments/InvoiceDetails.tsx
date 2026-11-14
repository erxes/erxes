import type { Invoice } from '@erxes/core-contract';
import { IconReceiptRefund } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Badge,
  Button,
  Dialog,
  Input,
  Label,
  RelativeDateDisplay,
  Spinner,
  Switch,
  Textarea,
  useToast,
} from 'erxes-ui';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '~/lib/api';
import { amountStep, fromAmountInput, toAmountInput, useMoney } from '~/lib/money';
import { useCan } from '~/modules/auth/session';
import { STATUS_BADGE } from './invoiceStatus';

const Refunds = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const money = useMoney();
  const refunds = useQuery(orpc.payments.refunds.queryOptions({ input: { id: invoice.id } }));

  return (
    <QueryState query={refunds} isEmpty={({ data }) => !data.length}>
      {({ data }) => (
        <ul className="divide-y rounded-lg border text-sm">
          {data.map((item) => (
            <li key={item.id} className="flex items-center gap-2 p-2">
              <Badge variant={item.status === 'succeeded' ? 'success' : 'destructive'}>
                {t(`refund-status.${item.status}`, item.status)}
              </Badge>
              <span className="font-medium">{money(item.amount, invoice.currency)}</span>
              <span className="truncate text-muted-foreground">{item.error ?? item.reason}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {item.method === 'manual' ? t('manual', 'manual') : t('via-gateway', 'gateway')} ·{' '}
                <RelativeDateDisplay value={item.createdAt} render={<span />}>
                  <RelativeDateDisplay.Value value={item.createdAt} />
                </RelativeDateDisplay>
              </span>
            </li>
          ))}
        </ul>
      )}
    </QueryState>
  );
};

const useRefund = (invoice: Invoice, onDone: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const { toast } = useToast();
  const client = useQueryClient();
  const money = useMoney();

  return useMutation(
    orpc.payments.refund.mutationOptions({
      onSuccess: ({ refund }) => {
        void client.invalidateQueries({ queryKey: orpc.payments.key() });

        if (refund.status === 'failed') {
          toast({
            variant: 'destructive',
            title: t('refund-refused', 'The gateway refused the refund'),
            description: refund.error ?? undefined,
          });

          return;
        }

        toast({
          title: t('refunded', 'Refunded {{amount}}', {
            amount: money(refund.amount, invoice.currency),
          }),
        });
        onDone();
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('refund-failed', 'Could not refund'),
          description: messageOf(error),
        }),
    }),
  );
};

/** A refund through the gateway, or recorded as paid back outside erxes. */
const RefundForm = ({ invoice, onDone }: { invoice: Invoice; onDone: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const id = useId();
  const money = useMoney();
  const { currency } = invoice;
  const left = invoice.refundable.amount;
  // A gateway that refunds whole payments only can't take part of it: record those as manual.
  const gatewayCanPartial = invoice.refundable.gateway === 'partial';
  const [amount, setAmount] = useState(toAmountInput(left, currency));
  const [reason, setReason] = useState('');

  const [manual, setManual] = useState(
    invoice.refundable.gateway === 'none' ||
      (invoice.refundable.gateway === 'full' && invoice.refundedAmount > 0),
  );

  const refund = useRefund(invoice, onDone);
  const units = fromAmountInput(amount, currency);
  const mustBeManual = !manual && !gatewayCanPartial && units !== left;

  return (
    <div className="space-y-3 border-t pt-3">
      <h3 className="flex items-center gap-2 text-sm font-medium">
        <IconReceiptRefund className="size-4" />
        {t('refund', 'Refund')}
      </h3>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-amount`}>
          {t('refund-amount', 'Amount (up to {{left}})', { left: money(left, currency) })}
        </Label>
        <Input
          id={`${id}-amount`}
          type="number"
          min={amountStep(currency)}
          step={amountStep(currency)}
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`${id}-reason`}>{t('refund-reason', 'Reason')}</Label>
        <Textarea
          id={`${id}-reason`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={2}
        />
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Switch
          id={`${id}-manual`}
          checked={manual}
          onCheckedChange={setManual}
          disabled={invoice.refundable.gateway === 'none'}
        />
        <Label htmlFor={`${id}-manual`} variant="option">
          {t('refund-manual', 'Already paid back outside erxes (record only)')}
        </Label>
      </div>
      {mustBeManual && (
        <p className="text-xs text-destructive">
          {t(
            'refund-full-only',
            'This gateway refunds whole payments only. Refund part of it outside erxes and record it.',
          )}
        </p>
      )}
      <Button
        className="w-full"
        variant="destructive"
        disabled={
          refund.isPending || !reason.trim() || !(units > 0 && units <= left) || mustBeManual
        }
        onClick={() => refund.mutate({ id: invoice.id, amount: units, reason, manual })}
      >
        {refund.isPending ? (
          <Spinner size="sm" />
        ) : (
          t('refund-confirm', 'Refund {{amount}}', { amount: money(units || 0, currency) })
        )}
      </Button>
    </div>
  );
};

/** One invoice: what was paid, its metadata and refunds, and a refund form for those allowed. */
export const InvoiceDetails = ({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments' });
  const can = useCan();
  const money = useMoney();

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content className="max-w-lg">
        <Dialog.HeaderCombined
          title={invoice.description}
          description={`${invoice.source} · ${invoice.referenceType} ${invoice.referenceId}`}
        />
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">{t('amount', 'Amount')}</dt>
          <dd>{money(invoice.amount, invoice.currency)}</dd>
          <dt className="text-muted-foreground">{t('paid', 'Paid')}</dt>
          <dd>{invoice.paidAmount === null ? '—' : money(invoice.paidAmount, invoice.currency)}</dd>
          <dt className="text-muted-foreground">{t('refunded-total', 'Refunded')}</dt>
          <dd>{money(invoice.refundedAmount, invoice.currency)}</dd>
          <dt className="text-muted-foreground">{t('status-label', 'Status')}</dt>
          <dd>
            <Badge variant={STATUS_BADGE[invoice.status]}>
              {t(`status.${invoice.status}`, invoice.status)}
            </Badge>
          </dd>
        </dl>
        {Object.keys(invoice.metadata).length > 0 && (
          <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
            {JSON.stringify(invoice.metadata, null, 2)}
          </pre>
        )}
        <Refunds invoice={invoice} />
        {can('payments.refund') && invoice.refundable.amount > 0 && (
          <RefundForm invoice={invoice} onDone={onClose} />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
