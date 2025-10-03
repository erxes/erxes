import { AccountsTable } from '@/settings/account/components/AccountsTable';
import { EditAccount } from '@/settings/account/components/EditAccount';
import { AccountsFilterBar } from '@/settings/account/components/AccountsFilterBar';

export const AccountPage = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <AccountsFilterBar />
      <div className="flex-auto p-3 overflow-hidden flex">
        <AccountsTable />
      </div>
      <EditAccount />
    </div>
  );
};
