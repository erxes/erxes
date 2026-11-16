import type { EbarimtReceipt, Invoice } from '@erxes/core-contract';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { IconReceiptTax } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, RelativeDateDisplay, Spinner, useMoney, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryState } from '~/components/QueryState';

const STATUS_BADGE = {
  pending: 'secondary',
  success: 'success',
  failed: 'destructive',
} as const satisfies Record<EbarimtReceipt['status'], string>;

const SendAgain = ({ invoiceId }: { invoiceId: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments.ebarimt' });
  const { toast } = useToast();
  const client = useQueryClient();

  const sync = useMutation(
    orpc.ebarimt.sync.mutationOptions({
      onSuccess: () => {
        toast({ title: t('queued', 'Sending the receipt again') });
        void client.invalidateQueries({ queryKey: orpc.ebarimt.receipts.key() });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('send-failed', 'Could not send'),
          description: messageOf(error),
        }),
    }),
  );

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={sync.isPending}
      onClick={() => sync.mutate({ invoiceId })}
    >
      {sync.isPending ? <Spinner size="sm" /> : t('send-again', 'Send again')}
    </Button>
  );
};

const ReceiptRow = ({ receipt, currency }: { receipt: EbarimtReceipt; currency: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments.ebarimt' });
  const money = useMoney();
  const what = receipt.kind === 'return' ? t('returned', 'Return') : t('issued', 'Receipt');

  return (
    <li className="space-y-1 p-2">
      <div className="flex items-center gap-2">
        <Badge variant={STATUS_BADGE[receipt.status]}>
          {t(`status.${receipt.status}`, receipt.status)}
        </Badge>
        <span className={receipt.inactiveAt ? 'text-muted-foreground line-through' : ''}>
          {what} {money(receipt.totalAmount, currency)}
        </span>
        <span className="truncate text-muted-foreground">
          {receipt.customerName ?? receipt.customerTin ?? receipt.consumerNo ?? ''}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          <RelativeDateDisplay value={receipt.createdAt} render={<span />}>
            <RelativeDateDisplay.Value value={receipt.createdAt} />
          </RelativeDateDisplay>
        </span>
      </div>
      {receipt.status === 'success' && receipt.kind === 'put' && (
        <p className="text-xs text-muted-foreground">
          {t('bill', 'Bill {{billId}} · lottery {{lottery}}', {
            billId: receipt.billId ?? '—',
            lottery: receipt.lottery ?? '—',
          })}
        </p>
      )}
      {receipt.error && <p className="text-xs text-destructive-text">{receipt.error}</p>}
    </li>
  );
};

/** The invoice's eBarimt receipts, newest first; a failed latest one can go again. */
export const EbarimtReceipts = ({ invoice }: { invoice: Invoice }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'payments.ebarimt' });

  const receipts = useQuery(
    orpc.ebarimt.receipts.queryOptions({ input: { invoiceId: invoice.id, limit: 20 } }),
  );

  return (
    <QueryState query={receipts} isEmpty={({ data }) => !data.length} empty={null} loading={null}>
      {({ data }) => (
        <div className="space-y-2">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <IconReceiptTax className="size-4" />
            {t('title', 'eBarimt')}
            {data[0]?.status === 'failed' && (
              <span className="ml-auto">
                <SendAgain invoiceId={invoice.id} />
              </span>
            )}
          </h3>
          <ul className="divide-y rounded-lg border text-sm">
            {data.map((receipt) => (
              <ReceiptRow key={receipt.id} receipt={receipt} currency={invoice.currency} />
            ))}
          </ul>
        </div>
      )}
    </QueryState>
  );
};
