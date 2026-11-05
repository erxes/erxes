import { useLocation } from 'react-router';
import { AddAccount } from '@/settings/account/components/AddAccount';
import { AddAccountCategory } from '@/settings/account/account-categories/components/AddAccountCategory';
import { AddFixedAssetCategory } from '@/settings/fixed-assets/components/AddFixedAssetCategory';
import { AddFixedAssetAccountConfig } from '@/settings/fixed-assets/account-config/components/FixedAssetAccountConfigsTable';
import { AddVats } from '@/settings/vat/components/AddVats';
import { AddCtaxs } from '@/settings/ctax/components/AddCtaxs';
import { AddJob } from '@/settings/jobs/components/AddJob';
import { AddAccountingConfig } from '../syncSettings/AddAccountingConfig';
import { ACCOUNTING_SETTINGS_CODES } from '../constants/settingsRoutes';
import { Can, Import } from 'ui-modules';

export const AccountingTopbar = () => {
  const { pathname } = useLocation();
  const fixedAssetCategoryPaths = [
    '/accounting/settings/config/fixed-assets/categories',
    '/accounting/settings/fixed-assets/categories',
  ];
  const fixedAssetPaths = [
    '/accounting/settings/config/fixed-assets/assets',
    '/accounting/settings/fixed-assets/assets',
  ];
  const fixedAssetAccountConfigPaths = [
    '/accounting/settings/config/fixed-assets/accounts-config',
    '/accounting/settings/fixed-assets/accounts-config',
  ];

  if (pathname === '/accounting/settings/config/accounts') {
    return (
      <div className="flex items-center gap-3">
        <AddAccount />
      </div>
    );
  }

  if (pathname === '/accounting/settings/config/account-categories') {
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
    return null;
  }

  if (fixedAssetAccountConfigPaths.includes(pathname)) {
    return (
      <div className="flex items-center gap-3">
        <AddFixedAssetAccountConfig />
      </div>
    );
  }

  if (pathname === '/accounting/settings/config/vat-rows') {
    return (
      <div className="flex items-center gap-3">
        <Can action="taxRowsImportManage">
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

  if (pathname === '/accounting/settings/config/ctax-rows') {
    return (
      <div className="flex items-center gap-3">
        <AddCtaxs />
      </div>
    );
  }

  if (
    [
      '/accounting/settings/inventories/jobs',
      '/accounting/settings/inventories/job-outputs',
    ].includes(pathname)
  ) {
    return (
      <div className="flex items-center gap-3">
        <AddJob />
      </div>
    );
  }

  if (pathname === '/accounting/settings/config/sync-deal') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL} />
      </div>
    );
  }

  if (pathname === '/accounting/settings/config/sync-deal-movement') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig
          code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_MOVEMENT}
        />
      </div>
    );
  }

  if (pathname === '/accounting/settings/config/sync-deal-return') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig
          code={ACCOUNTING_SETTINGS_CODES.SYNC_DEAL_RETURN}
        />
      </div>
    );
  }

  if (pathname === '/accounting/settings/config/sync-order') {
    return (
      <div className="flex items-center gap-3">
        <AddAccountingConfig code={ACCOUNTING_SETTINGS_CODES.SYNC_ORDER} />
      </div>
    );
  }

  return null;
};
