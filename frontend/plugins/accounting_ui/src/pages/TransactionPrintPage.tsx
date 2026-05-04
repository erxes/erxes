import { useLocation } from 'react-router-dom';
import { useTransactionDetail } from '~/modules/transactions/transaction-form/hooks/useTransactionDetail';

import { AccountingLayout } from '~/modules/layout/components/Layout';
import { AccountingHeader } from '~/modules/layout/components/Header';
import { useEffect, useRef } from 'react';
import { PrintBody } from '~/modules/transactions/transaction-form/components/documents';
// import { numberToWord } from 'erxes:master/packages/api-utils/src/numberUtils';

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
  if (loading) return <div className="p-10">Ачаалж байна...</div>;
  if (error)
    return (
      <div className="p-10 text-red-500">Алдаа гарлаа: {error.message}</div>
    );
  if (!transaction) return <div className="p-10">Гүйлгээ олдсонгүй.</div>;

  return (
    <AccountingLayout>
      <AccountingHeader />
      <style>
        {`
          @page { size: A4; margin: 10mm; }
          @media print {
            body { margin: 0; }
            #print-area { visibility: visible; position: absolute; left: 0; top: 0; width: 100%; }
            body > *:not(#print-area) { visibility: hidden; }
          }
        `}
      </style>
      <PrintBody transaction={transaction} />
    </AccountingLayout>
  );
};
