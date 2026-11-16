import { IconArrowsRightLeft, IconListCheck } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { TransactionsGroupForm } from '@/transactions/transaction-form/components/TransactionsGroupForm';
import { getTransactionReturnPath } from '@/transactions/utils/transactionNavigation';
import { AccountingLayout } from '@/layout/components/Layout';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingPath } from '@/types/AccountingPath';

export const TransactionPage = () => {
  const { t } = useTranslation('accounting');
  const [searchParams] = useSearchParams();
  const returnPath = getTransactionReturnPath(searchParams.get('returnTo'));
  const isRecordsReturn = returnPath.split('?')[0] === AccountingPath.Records;

  return (
    <AccountingLayout>
      <AccountingHeader
        returnLink={returnPath}
        returnText={isRecordsReturn ? t('journal-entries') : t('transactions')}
        icon={isRecordsReturn ? IconListCheck : IconArrowsRightLeft}
      />
      <TransactionsGroupForm />
    </AccountingLayout>
  );
};
