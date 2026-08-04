import { useLocation } from 'react-router-dom';
import { useTransactionDetail } from '~/modules/transactions/transaction-form/hooks/useTransactionDetail';

import { Button, Select, Spinner } from 'erxes-ui';
import { IconPrinter } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PrintBody } from '~/modules/transactions/transaction-form/components/documents';
import {
  getDefaultVariant,
  getDocumentVariants,
} from '~/modules/transactions/transaction-form/components/documents/variants';

export const TransactionPrintPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const transactionId = query.get('_id');

  const { transaction, loading, error } = useTransactionDetail({
    variables: { _id: transactionId },
    skip: !transactionId,
  });

  // Layout variants available for this transaction's journal.
  const variants = useMemo(
    () => (transaction ? getDocumentVariants(transaction) : []),
    [transaction],
  );
  const [variant, setVariant] = useState<string>('');

  // Reset to the journal's default layout once the transaction loads.
  useEffect(() => {
    if (transaction) {
      setVariant(getDefaultVariant(transaction.journal));
    }
  }, [transaction]);

  const hasPrintedRef = useRef(false);
  useEffect(() => {
    if (!loading && transaction && !hasPrintedRef.current) {
      hasPrintedRef.current = true;

      setTimeout(() => {
        globalThis.print();
      }, 300);
    }
  }, [loading, transaction]);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="sm" />
      </div>
    );
  if (error)
    return (
      <div className="flex h-screen items-center justify-center text-destructive">
        Алдаа гарлаа: {error.message}
      </div>
    );
  if (!transaction)
    return (
      <div className="flex h-screen items-center justify-center text-accent-foreground">
        Гүйлгээ олдсонгүй.
      </div>
    );

  return (
    <div className="min-h-screen bg-muted">
      <style>
        {`
          @page { size: A4; margin: 10mm; }
          @media print {
            html, body { margin: 0; background: #fff; }
            #print-toolbar { display: none !important; }
            #print-area { box-shadow: none !important; margin: 0 !important; }
          }
        `}
      </style>

      <div
        id="print-toolbar"
        className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b bg-background px-6 py-3"
      >
        {variants.length > 1 && (
          <Select
            value={variant}
            onValueChange={(value) => value && setVariant(value)}
          >
            <Select.Trigger className="h-9 w-64">
              <Select.Value placeholder="Баримтын загвар" />
            </Select.Trigger>
            <Select.Content>
              {variants.map((opt) => (
                <Select.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        )}

        <Button onClick={() => globalThis.print()} variant="secondary">
          <IconPrinter />
          Хэвлэх
        </Button>
      </div>

      <div className="flex justify-center py-8">
        <PrintBody transaction={transaction} variant={variant} />
      </div>
    </div>
  );
};
