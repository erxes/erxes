import { AccountCategoriesTable } from '@/settings/account/account-categories/components/AccountCategoriesTable';
import { EditAccountCategory } from '@/settings/account/account-categories/components/EditAccountsCategory';
import { AccountsFilter } from '@/settings/account/components/AccountsFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Can, Import } from 'ui-modules';

export const AccountCategoriesPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountsFilter />
        <Can action="accountCategoriesImportManage">
          <Import
            pluginName="accounting"
            moduleName="account"
            collectionName="accountCategories"
          />
        </Can>
      </PageSubHeader>
      <AccountCategoriesTable />
      <EditAccountCategory />
    </PageContainer>
  );
};
