import { IPermissionConfig } from 'erxes-api-shared/core-types';

export const permissions: IPermissionConfig = {
  plugin: 'payment',

  modules: [
    {
      name: 'invoice',
      description: 'Invoice management',
      scopeField: null,
      ownerFields: [],
      scopes: [
        { name: 'own', description: 'Records user created' },
        { name: 'all', description: 'All records' },
      ],
      actions: [
        {
          title: 'View invoices',
          name: 'invoicesView',
          description: 'View invoice records',
          always: true,
        },
        {
          title: 'Export invoices',
          name: 'invoicesExportManage',
          description: 'Export invoice records',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'payment:admin',
      name: 'Payment Admin',
      description: 'Full access to Payment plugin',
      permissions: [
        {
          plugin: 'payment',
          module: 'invoice',
          actions: ['invoicesView', 'invoicesExportManage'],
          scope: 'all',
        },
      ],
    },
  ],
};
