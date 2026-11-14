import { AccountingNotFound } from '@/layout/components/AccountingNotFound';
import { AccountingHeader } from '@/layout/components/Header';
import { AccountingLayout } from '@/layout/components/Layout';

export const AccountingNotFoundPage = () => {
  return (
    <AccountingLayout>
      <AccountingHeader />
      <AccountingNotFound />
    </AccountingLayout>
  );
};
