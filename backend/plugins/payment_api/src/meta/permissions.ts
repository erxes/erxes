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
          name: 'paymentInvoiceView',
          description: 'View invoice records',
          always: true,
        },
        {
          title: 'Edit invoices',
          name: 'paymentInvoiceEdit',
          description:
            'Edit invoice description, amount, currency and status',
        },
      ],
    },
  ],

  defaultGroups: [
    {
      id: 'payment:admin',
      name: 'Payment Admin',
      description: 'View and edit payment invoices',
      permissions: [
        {
          plugin: 'payment',
          module: 'invoice',
          actions: ['paymentInvoiceView', 'paymentInvoiceEdit'],
          scope: 'all',
        },
      ],
    },
    {
      id: 'payment:viewer',
      name: 'Payment Viewer',
      description: 'Read-only access to payment invoices',
      permissions: [
        {
          plugin: 'payment',
          module: 'invoice',
          actions: ['paymentInvoiceView'],
          scope: 'all',
        },
      ],
    },
  ],
};
