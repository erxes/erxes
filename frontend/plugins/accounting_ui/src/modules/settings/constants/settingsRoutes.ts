import {
  IconArrowBackUp,
  IconAssembly,
  IconBox,
  IconBuildingCommunity,
  IconCashRegister,
  IconCategory,
  IconFolders,
  IconHeartHandshake,
  IconLock,
  IconPackageExport,
  IconReceiptTax,
  IconSettings,
  IconTruckDelivery,
  IconWallet,
} from '@tabler/icons-react';
import { TNavigationSectionItem } from '@/NavigationSection';

export const SETTINGS_ROUTES: TNavigationSectionItem[] = [
  {
    name: 'general-settings',
    icon: IconSettings,
    path: 'accounting/settings/config',
    exact: true,
  },
  {
    name: 'account',
    icon: IconWallet,
    path: 'accounting/settings/config/accounts',
  },
  {
    name: 'account-category-label',
    icon: IconFolders,
    path: 'accounting/settings/config/account-categories',
  },
  {
    name: 'account-permissions',
    icon: IconLock,
    path: 'accounting/settings/config/permissions',
  },
  {
    name: 'vat-row-label',
    icon: IconReceiptTax,
    path: 'accounting/settings/config/vat-rows',
  },
  {
    name: 'city-tax-row',
    icon: IconBuildingCommunity,
    path: 'accounting/settings/config/ctax-rows',
  },
  {
    name: 'deal-rule',
    icon: IconHeartHandshake,
    path: 'accounting/settings/config/sync-deal',
  },
  {
    name: 'deal-inventory-movement-rule',
    icon: IconTruckDelivery,
    path: 'accounting/settings/config/sync-deal-movement',
  },
  {
    name: 'deal-return-rule',
    icon: IconArrowBackUp,
    path: 'accounting/settings/config/sync-deal-return',
  },
  {
    name: 'pos-order-rule-label',
    icon: IconCashRegister,
    path: 'accounting/settings/config/sync-order',
  },
];

export const FIXED_ASSET_SETTINGS_ROUTES: TNavigationSectionItem[] = [
  {
    name: 'fixed-assets',
    icon: IconBox,
    path: 'accounting/settings/fixed-assets/assets',
  },
  {
    name: 'category-label',
    icon: IconCategory,
    path: 'accounting/settings/fixed-assets/categories',
  },
  {
    name: 'account-configuration',
    icon: IconSettings,
    path: 'accounting/settings/fixed-assets/accounts-config',
  },
];

export const INVENTORY_SETTINGS_ROUTES: TNavigationSectionItem[] = [
  {
    name: 'job-production-stage',
    icon: IconAssembly,
    path: 'accounting/settings/inventories/jobs',
  },
  {
    name: 'job-production-stage-outputs',
    icon: IconPackageExport,
    path: 'accounting/settings/inventories/job-outputs',
  },
];

export enum ACCOUNTING_SETTINGS_CODES {
  SYNC_DEAL = 'syncDeal',
  SYNC_DEAL_MOVEMENT = 'syncDealMovement',
  SYNC_DEAL_RETURN = 'syncDealReturn',
  SYNC_ORDER = 'syncOrder',
}
