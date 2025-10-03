import { AccountCategoriesTable } from '@/settings/account/account-categories/components/AccountCategoriesTable';
import { EditAccountCategory } from '@/settings/account/account-categories/components/EditAccountsCategory';

export const AccountCategoriesPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-auto p-3 overflow-hidden flex">
        <AccountCategoriesTable />
      </div>
      <EditAccountCategory />
    </div>
  );
};
