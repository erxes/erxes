import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { AccountSettingsBreadcrumb } from './settings/components/AccountSettingsBreadcrumb';
import { AccountingTopbar } from './settings/components/AccountingTopbar';
import { AccountingSidebar } from './settings/components/Sidebar';

const AccountingMainConfig = lazy(() =>
  import('~/pages/SettingsPage').then((module) => ({
    default: module.SettingsPage,
  })),
);

const Accounts = lazy(() =>
  import('~/pages/AccountPage').then((module) => ({
    default: module.AccountPage,
  })),
);

const AccountCategories = lazy(() =>
  import('~/pages/AccountCategoriesPage').then((module) => ({
    default: module.AccountCategoriesPage,
  })),
);

const FixedAssets = lazy(() =>
  import('~/pages/FixedAssetsPage').then((module) => ({
    default: module.FixedAssetsPage,
  })),
);

const FixedAssetCategories = lazy(() =>
  import('~/pages/FixedAssetCategoriesPage').then((module) => ({
    default: module.FixedAssetCategoriesPage,
  })),
);

const VatRows = lazy(() =>
  import('~/pages/VatRowsPage').then((module) => ({
    default: module.VatRowsPage,
  })),
);

const CTaxRows = lazy(() =>
  import('~/pages/CtaxRowsPage').then((module) => ({
    default: module.CTaxRowsPage,
  })),
);

const SettingSyncDeal = lazy(() =>
  import('~/pages/syncConfigs/settingSyncDealPage').then((module) => ({
    default: module.SettingSyncDealPage,
  })),
);

const SettingSyncDealReturn = lazy(() =>
  import('~/pages/syncConfigs/settingSyncDealReturnPage').then((module) => ({
    default: module.SettingSyncDealReturnPage,
  })),
);

const SettingSyncOrder = lazy(() =>
  import('~/pages/syncConfigs/settingSyncOrderPage').then((module) => ({
    default: module.SettingSyncOrderPage,
  })),
);

const Permissions = lazy(() =>
  import('~/pages/PermissionsPage').then((module) => ({
    default: module.PermissionsPage,
  })),
);

const AccountingSubSettings = () => {
  return (
    <Filter id="accounting-settings">
      <div className="flex flex-col flex-auto overflow-hidden">
        <SettingsHeader breadcrumbs={<AccountSettingsBreadcrumb />}>
          <div className="flex ml-auto">
            <AccountingTopbar />
          </div>
        </SettingsHeader>
        <div className="flex flex-auto overflow-hidden">
          <AccountingSidebar />
          <Suspense
            fallback={
              <div className="flex flex-auto justify-center items-center h-full w-full">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route path="config" element={<AccountingMainConfig />} />
              <Route path="/config/accounts" element={<Accounts />} />
              <Route
                path="/config/account-categories"
                element={<AccountCategories />}
              />
              <Route
                path="/config/fixed-assets"
                element={
                  <Navigate
                    to="/settings/accounting/fixed-assets/assets"
                    replace
                  />
                }
              />
              <Route
                path="/config/fixed-assets/categories"
                element={
                  <Navigate
                    to="/settings/accounting/fixed-assets/categories"
                    replace
                  />
                }
              />
              <Route
                path="/config/fixed-assets/assets"
                element={
                  <Navigate
                    to="/settings/accounting/fixed-assets/assets"
                    replace
                  />
                }
              />
              <Route
                path="/fixed-assets"
                element={
                  <Navigate
                    to="/settings/accounting/fixed-assets/assets"
                    replace
                  />
                }
              />
              <Route
                path="/fixed-assets/categories"
                element={<FixedAssetCategories />}
              />
              <Route path="/fixed-assets/assets" element={<FixedAssets />} />
              <Route path="/config/vat-rows" element={<VatRows />} />
              <Route path="/config/ctax-rows" element={<CTaxRows />} />
              <Route path="/config/sync-deal" element={<SettingSyncDeal />} />
              <Route
                path="/config/sync-deal-return"
                element={<SettingSyncDealReturn />}
              />
              <Route path="/config/sync-order" element={<SettingSyncOrder />} />
              <Route path="/config/permissions" element={<Permissions />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};

const AccountingSettings = () => {
  return (
    <Routes>
      <Route path="/*" element={<AccountingSubSettings />} />
    </Routes>
  );
};

export default AccountingSettings;
