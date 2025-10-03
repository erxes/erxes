import { useLocation } from 'react-router';
import { AddAccount } from '@/settings/account/components/AddAccount';
import { AccountsFilter } from '@/settings/account/components/AccountsFilter';
import { AddAccountCategory } from '@/settings/account/account-categories/components/AddAccountCategory';
import { AddVats } from '@/settings/vat/components/AddVats';
import { AddCtaxs } from '@/settings/ctax/components/AddCtaxs';

export const AccountingTopbar = () => {
  const { pathname } = useLocation();

  if (pathname === '/settings/accounting/accounts') {
    return (
      <div className="flex items-center gap-3">
        <AccountsFilter />
        <AddAccount />
      </div>
    );
  }

  if (pathname === '/settings/accounting/account-categories') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountCategory />
      </div>
    );
  }

  if (pathname === '/settings/accounting/vat-rows') {
    return (
      <div className="flex items-center gap-3">
        <AddVats />
      </div>
    );
  }

  if (pathname === '/settings/accounting/ctax-rows') {
    return (
      <div className="flex items-center gap-3">
        <AddCtaxs />
      </div>
    );
  }

  return null;
};
