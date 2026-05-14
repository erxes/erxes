import { AccountsTable } from '@/settings/account/components/AccountsTable';
import { EditAccount } from '@/settings/account/components/EditAccount';
import { AccountsFilter } from '@/settings/account/components/AccountsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Import } from 'ui-modules';

export const AccountPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountsFilter />
        <Import
          pluginName="accounting"
          moduleName="account"
          collectionName="accounts"
        />
      </PageSubHeader>
      <AccountsTable />
      <EditAccount />
    </PageContainer>
  );
};
