import { AccountsTable } from '@/settings/account/components/AccountsTable';
import { EditAccount } from '@/settings/account/components/EditAccount';
import { AccountsFilter } from '@/settings/account/components/AccountsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';

export const AccountPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountsFilter />
      </PageSubHeader>
      <AccountsTable />
      <EditAccount />
    </PageContainer>
  );
};
