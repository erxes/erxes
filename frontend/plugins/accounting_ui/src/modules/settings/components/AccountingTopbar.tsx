import { useLocation } from 'react-router';
import { AddAccount } from '@/settings/account/components/AddAccount';
import { AddAccountCategory } from '@/settings/account/account-categories/components/AddAccountCategory';
import { AddVats } from '@/settings/vat/components/AddVats';
import { AddCtaxs } from '@/settings/ctax/components/AddCtaxs';
import { AddAccountingConfig } from '../syncSettings/AddAccountingConfig';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';

export const AccountingTopbar = () => {
  const { pathname } = useLocation();

  if (pathname === '/settings/accounting/accounts') {
    return (
      <div className="flex items-center gap-3">
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

  if (pathname === '/settings/accounting/sync-deal') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL} />
      </div>
    );
  }

  if (pathname === '/settings/accounting/sync-order') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_ORDER} />
      </div>
    );
  }

  return null;
};
