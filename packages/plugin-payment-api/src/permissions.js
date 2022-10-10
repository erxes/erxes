module.exports = {
  companies: {
    name: 'payments',
    description: 'Payments',
    actions: [
      {
        name: 'paymentsAll',
        description: 'All',
        use: [
          'paymentConfigsAdd',
          'paymentConfigsEdit',
          'paymentConfigRemove',
          'showPayments',
        ],
      },
      {
        name: 'paymentConfigsAdd',
        description: 'Add payments',
      },
      {
        name: 'paymentConfigsEdit',
        description: 'Edit payments',
      },
      {
        name: 'paymentConfigRemove',
        description: 'Remove payments',
      },
      {
        name: 'showPayments',
        description: 'Show payments',
      },
    ],
  },
  customers: {
    name: 'invoices',
    description: 'Invoices',
    actions: [
      {
        name: 'invoicesAll',
        description: 'All',
        use: [
          'showInvoices',
        ],
      },
      {
        name: 'showInvoices',
        description: 'Show invoices',
      },
    ],
  },
};
