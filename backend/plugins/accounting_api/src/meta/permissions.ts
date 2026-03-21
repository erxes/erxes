import { IPermissionConfig } from 'erxes-api-shared/core-types';

const ACTIONS = {
  read: 'accountsRead',
  manage: 'manageAccounts',
  remove: 'removeAccounts',
  merge: 'accountsMerge',
} as const;

const allActions = Object.values(ACTIONS);

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
        { title: 'View accounts', name: ACTIONS.read, description: 'View accounts', always: true },
        { title: 'Manage accounts', name: ACTIONS.manage, description: 'Create and edit accounts' },
        { title: 'Remove accounts', name: ACTIONS.remove, description: 'Remove accounts' },
        { title: 'Merge accounts', name: ACTIONS.merge, description: 'Merge accounts' },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'accounting:admin',
      name: 'Accounting Admin',
      description: 'Full access to Accounting plugin',
      permissions: [
        { plugin: 'accounting', module: 'account', actions: [...allActions], scope: 'all' },
      ],
    },
    {
      id: 'accounting:viewer',
      name: 'Accounting Viewer',
      description: 'Read-only access to Accounting plugin',
      permissions: [
        { plugin: 'accounting', module: 'account', actions: [ACTIONS.read], scope: 'all' },
      ],
    },
  ],
};
