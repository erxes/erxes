import {
  IconAdjustmentsCode,
  IconAssembly,
  IconBucketOff,
  IconBuildingWarehouse,
  IconCashBanknote,
  IconClipboardTextFilled,
  IconFlagStar,
  IconListCheck,
  IconListDetails,
  IconMoneybag,
  IconPackageExport,
  IconPackages,
  IconReceipt,
  IconRefreshAlert,
  IconReportAnalytics,
  IconScale,
  IconSettings,
  IconUserCheck,
} from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { SEARCH_PROVIDERS } from '~/searchProviders';
import { FXA_OWNER_RECORD_PANEL_CONTENT_TYPES } from '@/fixedAssets/ownerRecords/constants/ownerRecordPanel';
import { SETTINGS_PANEL_CONTENT_TYPES } from '@/settings/constants/settingsPanel';
import { ADJUSTMENT_PANEL_CONTENT_TYPES } from '@/adjustments/constants/adjustmentPanel';
import { TRANSACTION_CONTENT_TYPE } from '@/transactions/constants/transactionPanel';
import { SAFE_REMAINDER_CONTENT_TYPE } from '@/inventories/safeRemainders/constants/safeRemainderPanel';
import { RESERVE_REM_CONTENT_TYPE } from '@/inventories/reserveRemainders/constants/reserveRemPanel';
import { RECALC_REMAINDER_CONTENT_TYPE } from '@/inventories/remainders/constants/reCalcRemainderPanel';

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
      icon: IconListDetails,
      path: 'accounting/main',
    },
    {
      name: 'records',
      icon: IconListCheck,
      path: 'accounting/records',
    },
    {
      name: 'odd-transactions',
      icon: IconCashBanknote,
      path: 'accounting/odd-transactions',
    },
    {
      name: 'journal-reports',
      icon: IconClipboardTextFilled,
      path: 'accounting/journal-reports',
    },
    {
      name: 'tunable-reports',
      icon: IconReportAnalytics,
      path: 'accounting/tunable-reports',
    },
    {
      name: 'check-sync',
      icon: IconRefreshAlert,
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
      icon: IconMoneybag,
      path: 'accounting/fixed-assets/remainders',
    },
    {
      name: 'fixed-asset-owner-records',
      icon: IconUserCheck,
      path: 'accounting/fixed-assets/owner-records',
    },
    {
      name: 'config',
      icon: IconSettings,
      path: 'accounting/settings/config',
    },
    {
      name: 'fixed-assets',
      icon: IconBuildingWarehouse,
      path: 'accounting/settings/fixed-assets',
    },
    {
      name: 'inventory-jobs',
      icon: IconPackages,
      path: 'accounting/settings/inventories',
    },
    {
      name: 'job-executions',
      icon: IconAssembly,
      path: 'accounting/inventories/job-executions',
    },
    {
      name: 'inventory-job-outputs',
      icon: IconPackageExport,
      path: 'accounting/settings/inventories/job-outputs',
    },
  ],
  widgets: {
    relationWidgets: [
      {
        name: 'transactions',
        icon: IconReceipt,
        contentTypes: ['sales:deal'],
      },
    ],
    recordPanels: [
      ...SETTINGS_PANEL_CONTENT_TYPES,
      ...FXA_OWNER_RECORD_PANEL_CONTENT_TYPES,
      ...ADJUSTMENT_PANEL_CONTENT_TYPES,
      SAFE_REMAINDER_CONTENT_TYPE,
      RESERVE_REM_CONTENT_TYPE,
      RECALC_REMAINDER_CONTENT_TYPE,
      TRANSACTION_CONTENT_TYPE,
    ].map((contentType) => ({
      contentType,
      properties: false,
      draftTitle: true,
    })),
  },
  searchProviders: SEARCH_PROVIDERS,
};
