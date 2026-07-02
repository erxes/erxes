import { usePayments } from '@/payment/hooks/usePayments';
import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { paymentColumns } from './PaymentColumns';
import { PaymentsCommandBar } from './PaymentsCommandBar';

export function PaymentRecordTable() {
  const { payments, loading } = usePayments();
  const { t } = useTranslation('payment');
  return (
    <RecordTable.Provider
      data={payments || []}
      columns={paymentColumns(t)}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>

      <PaymentsCommandBar />
    </RecordTable.Provider>
  );
}
