import { IPermissionConfig } from 'erxes-api-shared/core-types';

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

const VAT_ROW_ACTIONS = {
  read: 'readVatRows',
  manage: 'manageVatRows',
  remove: 'removeVatRows',
} as const;

const CTAX_ROW_ACTIONS = {
  read: 'readCtaxRows',
  manage: 'manageCtaxRows',
  remove: 'removeCtaxRows',
} as const;

const ADJ_INV_ACTIONS = {
  read: 'readAdjustInventories',
  manage: 'manageAdjustInventories',
  publish: 'publishAdjustInventories',
  cancel: 'cancelAdjustInventories',
  remove: 'removeAdjustInventories',
  clear: 'clearAdjustInventories',
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
const allActions = Object.values(ACTIONS);
const allCategoryActions = Object.values(CATEGORY_ACTIONS); // for admin group
const allVatRowActions = Object.values(VAT_ROW_ACTIONS);
const allCtaxRowActions = Object.values(CTAX_ROW_ACTIONS);
const allAdjInvActions = Object.values(ADJ_INV_ACTIONS);
const allConfigActions = Object.values(CONFIG_ACTIONS);
const allCheckSyncActions = Object.values(CHECK_SYNC_ACTIONS);
const allPermissionActions = Object.values(ACCOUNT_PERMISSION_ACTIONS);

export const permissions: IPermissionConfig = {
  plugin: 'accounting',

  modules: [
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
      ],
    },
    {
      name: 'vatRow',
      description: 'VAT row management',
      scopes: [
        { name: 'own', description: 'VAT rows created by the user' },
        { name: 'all', description: 'All VAT rows' },
      ],
      actions: [
        {
          title: 'View VAT rows',
          name: VAT_ROW_ACTIONS.read,
          description: 'View VAT rows',
          always: true,
        },
        {
          title: 'Manage VAT rows',
          name: VAT_ROW_ACTIONS.manage,
          description: 'Create and edit VAT rows',
        },
        {
          title: 'Remove VAT rows',
          name: VAT_ROW_ACTIONS.remove,
          description: 'Delete VAT rows',
        },
      ],
    },
    {
      name: 'ctaxRow',
      description: 'CTax row management',
      scopes: [
        { name: 'own', description: 'CTax rows created by the user' },
        { name: 'all', description: 'All CTax rows' },
      ],
      actions: [
        {
          title: 'View CTax rows',
          name: CTAX_ROW_ACTIONS.read,
          description: 'View CTax rows',
          always: true,
        },
        {
          title: 'Manage CTax rows',
          name: CTAX_ROW_ACTIONS.manage,
          description: 'Create and edit CTax rows',
        },
        {
          title: 'Remove CTax rows',
          name: CTAX_ROW_ACTIONS.remove,
          description: 'Delete CTax rows',
        },
      ],
    },
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
          module: 'ctaxRow',
          actions: [...allCtaxRowActions],
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
          actions: [...allTransactionActions, 'transactionsImportManage'],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'vatRow',
          actions: [...allVatRowActions],
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
          module: 'ctaxRow',
          actions: [CTAX_ROW_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'transaction',
          actions: [TRANSACTION_ACTIONS.read],
          scope: 'all',
        },
        {
          plugin: 'accounting',
          module: 'vatRow',
          actions: [VAT_ROW_ACTIONS.read],
          scope: 'all',
        },
      ],
    },
  ],
};
