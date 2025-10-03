import { TransactionsGroupForm } from '@/transactions/transaction-form/components/TransactionsGroupForm';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';

export const TransactionPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader />
      <TransactionsGroupForm />
    </AccountingLayout>
  );
};
