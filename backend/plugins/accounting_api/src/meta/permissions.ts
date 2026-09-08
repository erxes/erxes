import { IPermissionConfig } from 'erxes-api-shared/core-types';
import { TRANSACTION_PERMISSION_ACTIONS } from '../modules/accounting/utils/transactionPermissions';

// Account actions
const ACTIONS = {
  read: 'accountsRead',
  manage: 'manageAccounts',
  remove: 'removeAccounts',
  merge: 'accountsMerge',
} as const;

// Category actions
const CATEGORY_ACTIONS = {
  manage: 'manageAccountCategories',
  read: 'readAccountCategories',
  remove: 'removeAccountCategories',
} as const;

const TRANSACTION_ACTIONS = {
  read: 'readTransactions',
  manage: 'manageTransactions',
  remove: 'removeTransactions',
  link: 'linkTransactions',
} as const;

const TAX_ROW_ACTIONS = {
  read: 'readTaxRows',
  manage: 'manageTaxRows',
  remove: 'removeTaxRows',
  import: 'taxRowsImportManage',
} as const;

const ADJ_INV_ACTIONS = {
  read: 'readAdjustInventories',
  manage: 'manageAdjustInventories',
  publish: 'publishAdjustInventories',
  cancel: 'cancelAdjustInventories',
  remove: 'removeAdjustInventories',
  clear: 'clearAdjustInventories',
} as const;

const ADJ_FXA_ACTIONS = {
  read: 'readAdjustFixedAssets',
  manage: 'manageAdjustFixedAssets',
  publish: 'publishAdjustFixedAssets',
  cancel: 'cancelAdjustFixedAssets',
  remove: 'removeAdjustFixedAssets',
  clear: 'clearAdjustFixedAssets',
} as const;

const ADJ_FUND_RATE_ACTIONS = {
  read: 'readAdjustFundRates',
  manage: 'manageAdjustFundRates',
  remove: 'removeAdjustFundRates',
} as const;

const ADJ_DEBT_RATE_ACTIONS = {
  read: 'readAdjustDebtRates',
  manage: 'manageAdjustDebtRates',
  remove: 'removeAdjustDebtRates',
} as const;

const ADJ_CLOSING_ACTIONS = {
  read: 'readAdjustClosings',
  manage: 'manageAdjustClosings',
  publish: 'publishAdjustClosings',
  cancel: 'cancelAdjustClosings',
  remove: 'removeAdjustClosings',
} as const;

const CONFIG_ACTIONS = {
  read: 'readAccountingConfigs',
  manage: 'manageAccountingConfigs',
  remove: 'removeAccountingConfigs',
} as const;

const CHECK_SYNC_ACTIONS = {
  read: 'readAccountingCheckSync',
  manage: 'manageAccountingCheckSync',
} as const;

const ACCOUNT_PERMISSION_ACTIONS = {
  read: 'readAccountPermissions',
  manage: 'manageAccountPermissions',
} as const;

const allTransactionActions = Object.values(TRANSACTION_ACTIONS);
const allJournalTransactionActions = Object.values(
  TRANSACTION_PERMISSION_ACTIONS,
).flatMap((actions) => Object.values(actions));
const allActions = Object.values(ACTIONS);
const allCategoryActions = Object.values(CATEGORY_ACTIONS); // for admin group
const allTaxRowActions = Object.values(TAX_ROW_ACTIONS);
const allAdjInvActions = Object.values(ADJ_INV_ACTIONS);
const allAdjFxaActions = Object.values(ADJ_FXA_ACTIONS);
const allAdjFundRateActions = Object.values(ADJ_FUND_RATE_ACTIONS);
const allAdjDebtRateActions = Object.values(ADJ_DEBT_RATE_ACTIONS);
const allAdjClosingActions = Object.values(ADJ_CLOSING_ACTIONS);
const allConfigActions = Object.values(CONFIG_ACTIONS);
const allCheckSyncActions = Object.values(CHECK_SYNC_ACTIONS);
const allPermissionActions = Object.values(ACCOUNT_PERMISSION_ACTIONS);

const JOURNAL_TITLES: Record<string, string> = {
  main: 'main journal',
  cash: 'cash journal',
  bank: 'bank journal',
  receivable: 'receivable journal',
  payable: 'payable journal',
  tax: 'tax journal',
  inv_fb: 'inventory opening journal',
  invIncome: 'inventory income journal',
  invOut: 'inventory out journal',
  invMove: 'inventory movement journal',
  invSale: 'inventory sale journal',
  invSaleReturn: 'inventory sale return journal',
  fxaIncome: 'fixed asset income journal',
  fxaOut: 'fixed asset out journal',
  fxaMove: 'fixed asset movement journal',
  fxaSale: 'fixed asset sale journal',
};

const journalTransactionActions = Object.entries(
  TRANSACTION_PERMISSION_ACTIONS,
).flatMap(([journal, actions]) => {
  const title = JOURNAL_TITLES[journal] || journal;

  return [
    {
      title: `View ${title} transactions`,
      name: actions.read,
      description: `View ${title} transactions`,
    },
    {
      title: `Manage ${title} transactions`,
      name: actions.manage,
      description: `Create and update ${title} transactions`,
    },
    {
      title: `Remove ${title} transactions`,
      name: actions.remove,
      description: `Delete ${title} transactions`,
    },
  ];
});

export const permissions: IPermissionConfig = {
  plugin: 'accounting',

  modules: [
    // --- account---
    {
      name: 'account',
      description: 'Accounting management',
      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],
      actions: [
        {
          title: 'View accounts',
          name: ACTIONS.read,
          description: 'View accounts',
          always: true,
        },
        {
          title: 'Manage accounts',
          name: ACTIONS.manage,
          description: 'Create and edit accounts',
        },
        {
          title: 'Remove accounts',
          name: ACTIONS.remove,
          description: 'Remove accounts',
        },
        {
          title: 'Merge accounts',
          name: ACTIONS.merge,
          description: 'Merge accounts',
        },
        {
          title: 'Import accounts',
          name: 'accountsImportManage',
          description: 'Import accounts',
        },
      ],
    },

    // --- accountCategory---
    {
      name: 'accountCategory',
      description: 'Account category management',
      scopes: [
        { name: 'own', description: 'Categories created by the user' },
        { name: 'all', description: 'All categories' },
      ],
      actions: [
        {
          title: 'View categories',
          name: CATEGORY_ACTIONS.read,
          description: 'View account categories',
          always: true,
        },
        {
          title: 'Manage categories',
          name: CATEGORY_ACTIONS.manage,
          description: 'Create, edit account categories',
        },
        {
          title: 'Remove categories',
          name: CATEGORY_ACTIONS.remove,
          description: 'Remove account categories',
        },
        {
          title: 'Import account categories',
          name: 'accountCategoriesImportManage',
          description: 'Import account categories',
        },
      ],
    },
    // --- transaction---
    {
      name: 'transaction',
      description: 'Transaction management',
      scopes: [
        { name: 'own', description: 'Transactions created by the user' },
        { name: 'all', description: 'All transactions' },
      ],
      actions: [
        {
          title: 'View transactions',
          name: TRANSACTION_ACTIONS.read,
          description: 'View transactions',
          always: true,
        },
        {
          title: 'Manage transactions',
          name: TRANSACTION_ACTIONS.manage,
          description: 'Create and update transactions',
        },
        {
          title: 'Remove transactions',
          name: TRANSACTION_ACTIONS.remove,
          description: 'Delete transactions',
        },
        {
          title: 'Link transactions',
          name: TRANSACTION_ACTIONS.link,
          description: 'Link transactions',
        },
        {
          title: 'Import transactions',
          name: 'transactionsImportManage',
          description: 'Import transactions',
        },
        ...journalTransactionActions,
      ],
    },
    // --- taxRow---
    {
      name: 'taxRow',
      description: 'Tax row management',
      scopes: [
        { name: 'own', description: 'Tax rows created by the user' },
        { name: 'all', description: 'All tax rows' },
      ],
      actions: [
        {
          title: 'View tax rows',
          name: TAX_ROW_ACTIONS.read,
          description: 'View tax rows',
          always: true,
        },
        {
          title: 'Manage tax rows',
          name: TAX_ROW_ACTIONS.manage,
          description: 'Create and edit tax rows',
        },
        {
          title: 'Remove tax rows',
          name: TAX_ROW_ACTIONS.remove,
          description: 'Delete tax rows',
        },
        {
          title: 'Import tax rows',
          name: TAX_ROW_ACTIONS.import,
          description: 'Import tax rows',
        },
      ],
    },
    // --- adjustInventory---
    {
      name: 'adjustInventory',
      description: 'Inventory adjustment management',
      scopes: [
        { name: 'own', description: 'Adjustments created by the user' },
        { name: 'all', description: 'All adjustments' },
      ],
      actions: [
        {
          title: 'View adjustments',
          name: ADJ_INV_ACTIONS.read,
          description: 'View inventory adjustments',
          always: true,
        },
        {
          title: 'Manage adjustments',
          name: ADJ_INV_ACTIONS.manage,
          description: 'Create and run inventory adjustments',
        },
        {
          title: 'Publish adjustments',
          name: ADJ_INV_ACTIONS.publish,
          description: 'Publish an adjustment',
        },
        {
          title: 'Cancel adjustments',
          name: ADJ_INV_ACTIONS.cancel,
          description: 'Cancel a published adjustment',
        },
        {
          title: 'Remove adjustments',
          name: ADJ_INV_ACTIONS.remove,
          description: 'Delete an adjustment',
        },
        {
          title: 'Clear adjustments',
          name: ADJ_INV_ACTIONS.clear,
          description: 'Clear an adjustment',
        },
      ],
    },
    // --- adjustFixedAsset---
    {
      name: 'adjustFixedAsset',
      description: 'Fixed asset adjustment management',
      scopes: [
        { name: 'own', description: 'Adjustments created by the user' },
        { name: 'all', description: 'All adjustments' },
      ],
      actions: [
        {
          title: 'View fixed asset adjustments',
          name: ADJ_FXA_ACTIONS.read,
          description: 'View fixed asset adjustments',
          always: true,
        },
        {
          title: 'Manage fixed asset adjustments',
          name: ADJ_FXA_ACTIONS.manage,
          description: 'Create and run fixed asset adjustments',
        },
        {
          title: 'Publish fixed asset adjustments',
          name: ADJ_FXA_ACTIONS.publish,
          description: 'Publish a fixed asset adjustment',
        },
        {
          title: 'Cancel fixed asset adjustments',
          name: ADJ_FXA_ACTIONS.cancel,
          description: 'Cancel a published fixed asset adjustment',
        },
        {
          title: 'Remove fixed asset adjustments',
          name: ADJ_FXA_ACTIONS.remove,
          description: 'Delete a fixed asset adjustment',
        },
        {
          title: 'Clear fixed asset adjustments',
          name: ADJ_FXA_ACTIONS.clear,
          description: 'Clear a fixed asset adjustment',
        },
      ],
    },
    // --- adjustFundRate---
    {
      name: 'adjustFundRate',
      description: 'Fund exchange rate adjustment management',
      scopes: [
        { name: 'own', description: 'Adjustments created by the user' },
        { name: 'all', description: 'All adjustments' },
      ],
      actions: [
        {
          title: 'View fund rate adjustments',
          name: ADJ_FUND_RATE_ACTIONS.read,
          description: 'View fund exchange rate adjustments',
          always: true,
        },
        {
          title: 'Manage fund rate adjustments',
          name: ADJ_FUND_RATE_ACTIONS.manage,
          description: 'Create and run fund exchange rate adjustments',
        },
        {
          title: 'Remove fund rate adjustments',
          name: ADJ_FUND_RATE_ACTIONS.remove,
          description: 'Delete fund exchange rate adjustments',
        },
      ],
    },
    // --- adjustDebtRate---
    {
      name: 'adjustDebtRate',
      description: 'Debt exchange rate adjustment management',
      scopes: [
        { name: 'own', description: 'Adjustments created by the user' },
        { name: 'all', description: 'All adjustments' },
      ],
      actions: [
        {
          title: 'View debt rate adjustments',
          name: ADJ_DEBT_RATE_ACTIONS.read,
          description: 'View debt exchange rate adjustments',
          always: true,
        },
        {
          title: 'Manage debt rate adjustments',
          name: ADJ_DEBT_RATE_ACTIONS.manage,
          description: 'Create and run debt exchange rate adjustments',
        },
        {
          title: 'Remove debt rate adjustments',
          name: ADJ_DEBT_RATE_ACTIONS.remove,
          description: 'Delete debt exchange rate adjustments',
        },
      ],
    },
    // --- adjustClosing---
    {
      name: 'adjustClosing',
      description: 'Closing adjustment management',
      scopes: [
        { name: 'own', description: 'Adjustments created by the user' },
        { name: 'all', description: 'All adjustments' },
      ],
      actions: [
        {
          title: 'View closing adjustments',
          name: ADJ_CLOSING_ACTIONS.read,
          description: 'View closing adjustments',
          always: true,
        },
        {
          title: 'Manage closing adjustments',
          name: ADJ_CLOSING_ACTIONS.manage,
          description: 'Create and run closing adjustments',
        },
        {
          title: 'Publish closing adjustments',
          name: ADJ_CLOSING_ACTIONS.publish,
          description: 'Publish a closing adjustment',
        },
        {
          title: 'Cancel closing adjustments',
          name: ADJ_CLOSING_ACTIONS.cancel,
          description: 'Cancel a published closing adjustment',
        },
        {
          title: 'Remove closing adjustments',
          name: ADJ_CLOSING_ACTIONS.remove,
          description: 'Delete closing adjustments',
        },
      ],
    },
    // --- config---
    {
      name: 'config',
      description: 'Accounting configuration management',
      scopes: [
        { name: 'own', description: 'Configs created by the user' },
        { name: 'all', description: 'All configs' },
      ],
      actions: [
        {
          title: 'View configs',
          name: CONFIG_ACTIONS.read,
          description: 'View accounting configs',
          always: true,
        },
        {
          title: 'Manage configs',
          name: CONFIG_ACTIONS.manage,
          description: 'Create and update accounting configs',
        },
        {
          title: 'Remove configs',
          name: CONFIG_ACTIONS.remove,
          description: 'Delete accounting configs',
        },
      ],
    },
    // --- checkSync---
    {
      name: 'checkSync',
      description: 'Accounting check sync management',
      scopes: [
        { name: 'own', description: 'Check sync records created by the user' },
        { name: 'all', description: 'All check sync records' },
      ],
      actions: [
        {
          title: 'View check sync',
          name: CHECK_SYNC_ACTIONS.read,
          description: 'Check accounting transaction sync status',
          always: true,
        },
        {
          title: 'Manage check sync',
          name: CHECK_SYNC_ACTIONS.manage,
          description: 'Sync deals and orders to accounting transactions',
        },
      ],
    },
  ],
  defaultGroups: [
    {
      id: 'accounting:admin',
      name: 'Accounting Admin',
      description: 'Full access to Accounting plugin',
      permissions: [
        {
          plugin: 'accounting',
          module: 'account',
          actions: [...allActions, 'accountsImportManage'],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'accountCategory',
          actions: [...allCategoryActions, 'accountCategoriesImportManage'],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'taxRow',
          actions: [...allTaxRowActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustInventory',
          actions: [...allAdjInvActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustFixedAsset',
          actions: [...allAdjFxaActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustFundRate',
          actions: [...allAdjFundRateActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustDebtRate',
          actions: [...allAdjDebtRateActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustClosing',
          actions: [...allAdjClosingActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'config',
          actions: [...allConfigActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'checkSync',
          actions: [...allCheckSyncActions],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'permission',
          actions: [...allPermissionActions],
          scope: 'all',
        },

        {
          plugin: 'accounting',
          module: 'transaction',
          actions: [
            ...allTransactionActions,
            ...allJournalTransactionActions,
            'transactionsImportManage',
          ],
          scope: 'all',
        },
      ],
    },
    {
      id: 'accounting:viewer',
      name: 'Accounting Viewer',
      description: 'Read-only access to Accounting plugin',
      permissions: [
        {
          plugin: 'accounting',
          module: 'account',
          actions: [ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'accountCategory',
          actions: [CATEGORY_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustInventory',
          actions: [ADJ_INV_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustFixedAsset',
          actions: [ADJ_FXA_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustFundRate',
          actions: [ADJ_FUND_RATE_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustDebtRate',
          actions: [ADJ_DEBT_RATE_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'adjustClosing',
          actions: [ADJ_CLOSING_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'config',
          actions: [CONFIG_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'checkSync',
          actions: [CHECK_SYNC_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'permission',
          actions: [ACCOUNT_PERMISSION_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'transaction',
          actions: [
            TRANSACTION_ACTIONS.read,
            ...Object.values(TRANSACTION_PERMISSION_ACTIONS).map(
              (actions) => actions.read,
            ),
          ],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'taxRow',
          actions: [TAX_ROW_ACTIONS.read],
          scope: 'all',
        },
      ],
    },
  ],
};
