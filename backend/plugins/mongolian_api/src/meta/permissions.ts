import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'mongolian',

  modules: [
    {
      name: 'configs',
      description: 'Mongolian configuration',
      scopeField: null,
      ownerFields: [],
      scopes: [
        {
          name: 'all',
          description: 'All configurations',
        },
      ],
      actions: [
        {
          title: 'View Mongolian configs',
          name: 'showMnConfig',
          description: 'View Mongolian configurations',
          always: true,
        },
        {
          title: 'Manage Mongolian configs',
          name: 'manageMnConfig',
          description: 'Create, update, and delete Mongolian configs',
        },
      ],
    },
    {
      name: 'ebarimtProductRules',
      description: 'Ebarimt product rules',
      scopeField: null,
      ownerFields: [],
      scopes: [
        {
          name: 'all',
          description: 'All product rules',
        },
      ],
      actions: [
        {
          title: 'View product rules',
          name: 'showProductRules',
          description: 'View ebarimt product rules',
          always: true,
        },
        {
          title: 'Manage product rules',
          name: 'manageProductRules',
          description: 'Create, update, and delete product rules',
        },
      ],
    },
    {
      name: 'ebarimtProductGroups',
      description: 'Ebarimt product groups',
      scopeField: null,
      ownerFields: [],
      scopes: [
        {
          name: 'all',
          description: 'All product groups',
        },
      ],
      actions: [
        {
          title: 'View product groups',
          name: 'showProductGroups',
          description: 'View ebarimt product groups',
          always: true,
        },
        {
          title: 'Manage product groups',
          name: 'manageProductGroups',
          description: 'Create, update, and delete product groups',
        },
      ],
    },
    {
      name: 'erkhet',
      description: 'Erkhet synchronization and queries',
      scopeField: null,
      ownerFields: [],
      scopes: [
        {
          name: 'all',
          description: 'All Erkhet operations',
        },
      ],
      actions: [
        {
          title: 'Manage Erkhet sync',
          name: 'erkhetManageSync',
          description: 'Trigger and manage Erkhet synchronization',
        },
        {
          title: 'View remainders',
          name: 'showErkhetRemainders',
          description: 'View product remainders from Erkhet',
          always: true,
        },
        {
          title: 'View customer debt',
          name: 'showErkhetDebt',
          description: 'View customer debt information from Erkhet',
          always: true,
        },
        {
          title: 'View sync history',
          name: 'showErkhetSyncHistory',
          description: 'View Erkhet synchronization history logs',
          always: true,
        },
      ],
    },
    {
      name: 'exchangeRates',
      description: 'Exchange rates management',
      scopeField: null,
      ownerFields: [],
      scopes: [
        {
          name: 'all',
          description: 'All exchange rates',
        },
      ],
      actions: [
        {
          title: 'View exchange rates',
          name: 'showExchangeRates',
          description: 'View exchange rates',
          always: true,
        },
        {
          title: 'Manage exchange rates',
          name: 'exchangeRatesManage',
          description: 'Create, update, and delete exchange rates',
        },
      ],
    },
    {
      name: 'msdynamic',
      description: 'MS Dynamics 365 Business Central synchronization',
      scopeField: null,
      ownerFields: [],
      scopes: [
        {
          name: 'all',
          description: 'All MS Dynamic operations',
        },
      ],
      actions: [
        {
          title: 'View MS Dynamic data',
          name: 'showMsd',
          description:
            'View MS Dynamic sync history, product remainder, customer relations',
          always: true,
        },
        {
          title: 'Check MS Dynamic sync status',
          name: 'msdCheck',
          description:
            'View the sync status of products between erxes and MS Dynamic',
          always: true,
        },
        {
          title: 'Trigger MS Dynamic sync',
          name: 'msdSync',
          description:
            'Sync products, customers, and send orders to MS Dynamic',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'mongolian:admin',
      name: 'Mongolian Admin',
      description: 'Full access to Mongolian plugin',
      permissions: [
        {
          plugin: 'mongolian',
          module: 'configs',
          actions: ['showMnConfig', 'manageMnConfig'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'ebarimtProductRules',
          actions: ['showProductRules', 'manageProductRules'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'ebarimtProductGroups',
          actions: ['showProductGroups', 'manageProductGroups'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'erkhet',
          actions: [
            'erkhetManageSync',
            'showErkhetRemainders',
            'showErkhetDebt',
            'showErkhetSyncHistory',
          ],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'exchangeRates',
          actions: ['showExchangeRates', 'exchangeRatesManage'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'msdynamic',
          actions: ['showMsd', 'msdCheck', 'msdSync'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'mongolian:user',
      name: 'Mongolian User',
      description: 'Standard user with view and limited management',
      permissions: [
        {
          plugin: 'mongolian',
          module: 'configs',
          actions: ['showMnConfig'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'ebarimtProductRules',
          actions: ['showProductRules'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'ebarimtProductGroups',
          actions: ['showProductGroups'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'erkhet',
          actions: [
            'showErkhetRemainders',
            'showErkhetDebt',
            'showErkhetSyncHistory',
          ],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'exchangeRates',
          actions: ['showExchangeRates'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'msdynamic',
          actions: ['showMsd', 'msdCheck'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'mongolian:viewer',
      name: 'Mongolian Viewer',
      description: 'Read-only access to Mongolian plugin',
      permissions: [
        {
          plugin: 'mongolian',
          module: 'configs',
          actions: ['showMnConfig'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'ebarimtProductRules',
          actions: ['showProductRules'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'ebarimtProductGroups',
          actions: ['showProductGroups'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'erkhet',
          actions: [
            'showErkhetRemainders',
            'showErkhetDebt',
            'showErkhetSyncHistory',
          ],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'exchangeRates',
          actions: ['showExchangeRates'],
          scope: 'all',
        },
        {
          plugin: 'mongolian',
          module: 'msdynamic',
          actions: ['showMsd', 'msdCheck'],
          scope: 'all',
        },
      ],
    },
  ],
};