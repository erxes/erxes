import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
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

const SettingSyncOrder = lazy(() =>
  import('~/pages/syncConfigs/settingSyncOrderPage').then((module) => ({
    default: module.SettingSyncOrderPage,
  })),
);

const AccountingSettings = () => {
  return (
    <Filter id='accounting-settings'>
      <div className='flex flex-col flex-auto overflow-hidden'>
        <SettingsHeader breadcrumbs={<AccountSettingsBreadcrumb />}>
          <div className='flex ml-auto'>
            <AccountingTopbar />
          </div>
        </SettingsHeader>
        <div className='flex flex-auto overflow-hidden'>
          <AccountingSidebar />
          <Suspense
            fallback={
              <div className='flex justify-center items-center h-full'>
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route path='/' element={<AccountingMainConfig />} />
              <Route path='/accounts' element={<Accounts />} />
              <Route
                path='/account-categories'
                element={<AccountCategories />}
              />
              <Route path='/vat-rows' element={<VatRows />} />
              <Route path='/ctax-rows' element={<CTaxRows />} />
              <Route path='/sync-deal' element={<SettingSyncDeal />} />
              <Route path='/sync-order' element={<SettingSyncOrder />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};

export default AccountingSettings;
