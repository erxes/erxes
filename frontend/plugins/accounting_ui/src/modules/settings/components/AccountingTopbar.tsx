import { useLocation } from 'react-router';
import { AddAccount } from '@/settings/account/components/AddAccount';
import { AddAccountCategory } from '@/settings/account/account-categories/components/AddAccountCategory';
import { AddFixedAsset } from '@/settings/fixed-assets/components/AddFixedAsset';
import { AddFixedAssetCategory } from '@/settings/fixed-assets/components/AddFixedAssetCategory';
import { AddVats } from '@/settings/vat/components/AddVats';
import { AddCtaxs } from '@/settings/ctax/components/AddCtaxs';
import { AddAccountingConfig } from '../syncSettings/AddAccountingConfig';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { Can, Import } from 'ui-modules';

export const AccountingTopbar = () => {
  const { pathname } = useLocation();
  const fixedAssetCategoryPaths = [
    '/settings/accounting/config/fixed-assets/categories',
    '/settings/accounting/fixed-assets/categories',
  ];
  const fixedAssetPaths = [
    '/settings/accounting/config/fixed-assets/assets',
    '/settings/accounting/fixed-assets/assets',
  ];

  if (pathname === '/settings/accounting/config/accounts') {
    return (
      <div className="flex items-center gap-3">
        <AddAccount />
      </div>
    );
  }

  if (pathname === '/settings/accounting/config/account-categories') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountCategory />
      </div>
    );
  }

  if (fixedAssetCategoryPaths.includes(pathname)) {
    return (
      <div className="flex items-center gap-3">
        <AddFixedAssetCategory />
      </div>
    );
  }

  if (fixedAssetPaths.includes(pathname)) {
    return (
      <div className="flex items-center gap-3">
        <AddFixedAsset />
      </div>
    );
  }

  if (pathname === '/settings/accounting/config/vat-rows') {
    return (
      <div className="flex items-center gap-3">
        <Can action="vatRowsImportManage">
          <Import
            pluginName="accounting"
            moduleName="account"
            collectionName="vatRows"
          />
        </Can>
        <AddVats />
      </div>
    );
  }

  if (pathname === '/settings/accounting/config/ctax-rows') {
    return (
      <div className="flex items-center gap-3">
        <AddCtaxs />
      </div>
    );
  }

  if (pathname === '/settings/accounting/config/sync-deal') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL} />
      </div>
    );
  }

  if (pathname === '/settings/accounting/config/sync-deal-return') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig
          code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN}
        />
      </div>
    );
  }

  if (pathname === '/settings/accounting/config/sync-order') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_ORDER} />
      </div>
    );
  }

  return null;
};
