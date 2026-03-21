import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'accounting',

  modules: [
    {
      name: 'account',
      description: 'Accounting management',

      scopes: [
        {
          name: 'own',
          description: 'Records user created',
        },
        {
          name: 'all',
          description: 'All records',
        },
      ],

      actions: [
        {
          title: 'View accounts',
          name: 'accountsRead',
          description: 'View accounts',
          always: true,
        },
        {
          title: 'Manage accounts',
          name: 'manageAccounts',
          description: 'Create and edit accounts',
        },
        {
          title: 'Remove accounts',
          name: 'removeAccounts',
          description: 'Remove accounts',
        },
        {
          title: 'Merge accounts',
          name: 'accountsMerge',
          description: 'Merge accounts',
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
          actions: [
            'accountsRead',
            'manageAccounts',
            'removeAccounts',
            'accountsMerge',
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
          actions: ['accountsRead'],
          scope: 'all',
        },
      ],
    },
  ],
};
