import { AccountsTable } from '@/settings/account/components/AccountsTable';
import { EditAccount } from '@/settings/account/components/EditAccount';
import { AccountsFilter } from '@/settings/account/components/AccountsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Can, Import } from 'ui-modules';

export const AccountPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountsFilter />
        <Can action="accountsImportManage">
          <Import
            pluginName="accounting"
            moduleName="account"
            collectionName="accounts"
          />
        </Can>
      </PageSubHeader>
      <AccountsTable />
      <EditAccount />
    </PageContainer>
  );
};
