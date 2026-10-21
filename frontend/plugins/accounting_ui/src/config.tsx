import {
  IconAdjustmentsCode,
  IconBucketOff,
  IconCashBanknote,
  IconFlagStar,
  IconReceipt,
  IconScale,
} from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';

export const CONFIG: IUIConfig = {
  name: 'accounting',
  path: 'accounting',
  navigationGroup: {
    name: 'accounting',
    defaultPath: 'accounting/main',
    icon: IconCashBanknote,
  },
  modules: [
    {
      name: 'documents',
      icon: IconCashBanknote,
      path: 'accounting/main',
    },
    {
      name: 'records',
      icon: IconCashBanknote,
      path: 'accounting/records',
    },
    {
      name: 'odd-transactions',
      icon: IconCashBanknote,
      path: 'accounting/odd-transactions',
    },
    {
      name: 'journal-reports',
      icon: IconCashBanknote,
      path: 'accounting/journal-reports',
    },
    {
      name: 'check-sync',
      icon: IconCashBanknote,
      path: 'accounting/check-sync',
    },
    {
      name: 'fund-rate-adjustment',
      icon: IconAdjustmentsCode,
      path: 'accounting/adjustment/fundRate',
    },
    {
      name: 'debt-rate-adjustment',
      icon: IconAdjustmentsCode,
      path: 'accounting/adjustment/debRate',
    },
    {
      name: 'inventory-cost-calc',
      icon: IconAdjustmentsCode,
      path: 'accounting/adjustment/inventory',
    },
    {
      name: 'fixed-asset-adjustment',
      icon: IconAdjustmentsCode,
      path: 'accounting/adjustment/fxa',
    },
    {
      name: 'closing-entry',
      icon: IconAdjustmentsCode,
      path: 'accounting/adjustment/closing',
    },
    {
      name: 'inventory-remainders',
      icon: IconFlagStar,
      path: 'accounting/inventories/remainders',
    },
    {
      name: 'inventory-count',
      icon: IconScale,
      path: 'accounting/inventories/safe-remainders',
    },
    {
      name: 'reserve-remainders',
      icon: IconBucketOff,
      path: 'accounting/inventories/reserve-remainders',
    },
    {
      name: 'fixed-asset-remainders',
      icon: IconCashBanknote,
      path: 'accounting/fixed-assets/remainders',
    },
    {
      name: 'fixed-asset-owner-records',
      icon: IconCashBanknote,
      path: 'accounting/fixed-assets/owner-records',
    },
    {
      name: 'config',
      icon: IconCashBanknote,
      path: 'accounting/settings/config',
    },
    {
      name: 'fixed-assets',
      icon: IconCashBanknote,
      path: 'accounting/settings/fixed-assets',
    },
    {
      name: 'inventory-jobs',
      icon: IconFlagStar,
      path: 'accounting/settings/inventories',
    },
    {
      name: 'job-executions',
      icon: IconFlagStar,
      path: 'accounting/inventories/job-executions',
    },
    {
      name: 'inventory-job-outputs',
      icon: IconFlagStar,
      path: 'accounting/settings/inventories/job-outputs',
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'transactions',
        icon: IconReceipt,
      },
    ],
  },
  searchProviders: SEARCH_PROVIDERS,
};
