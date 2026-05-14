import { AccountCategoriesTable } from '@/settings/account/account-categories/components/AccountCategoriesTable';
import { EditAccountCategory } from '@/settings/account/account-categories/components/EditAccountsCategory';
import { AccountsFilter } from '@/settings/account/components/AccountsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Import } from 'ui-modules';

export const AccountCategoriesPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountsFilter />
        <Import
          pluginName="accounting"
          moduleName="account"
          collectionName="accountCategories"
        />
      </PageSubHeader>
      <AccountCategoriesTable />
      <EditAccountCategory />
    </PageContainer>
  );
};
