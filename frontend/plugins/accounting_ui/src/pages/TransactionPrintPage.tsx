import { useLocation } from 'react-router-dom';
import { useTransactionDetail } from '~/modules/transactions/transaction-form/hooks/useTransactionDetail';

import { Button, Spinner } from 'erxes-ui';
import { IconPrinter } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { PrintBody } from '~/modules/transactions/transaction-form/components/documents';

export const TransactionPrintPage = () => {
  const query = new URLSearchParams(useLocation().search);
  const transactionId = query.get('_id');

  const { transaction, loading, error } = useTransactionDetail({
    variables: { _id: transactionId },
    skip: !transactionId,
  });
  const hasPrintedRef = useRef(false);
  useEffect(() => {
    if (!loading && transaction && !hasPrintedRef.current) {
      hasPrintedRef.current = true;

      setTimeout(() => {
        window.print();
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
        className="sticky top-0 z-10 flex items-center justify-end gap-2 border-b bg-background px-6 py-3"
      >
        <Button onClick={() => window.print()} variant="secondary">
          <IconPrinter />
          Хэвлэх
        </Button>
      </div>

      <div className="flex justify-center py-8">
        <PrintBody transaction={transaction} />
      </div>
    </div>
  );
};
