import { AccountCategoriesTable } from '@/settings/account/account-categories/components/AccountCategoriesTable';
import { EditAccountCategory } from '@/settings/account/account-categories/components/EditAccountsCategory';
import { AccountCategoriesFilter } from '@/settings/account/account-categories/components/AccountCategoriesFilter';
import { PageContainer, PageSubHeader } from 'erxes-ui';
import { Can, Import } from 'ui-modules';

export const AccountCategoriesPage = () => {
  return (
    <PageContainer>
      <PageSubHeader>
        <AccountCategoriesFilter />
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
