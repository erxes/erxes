module.exports = {
  name: 'contacts',
  port: 3011,
  scope: 'contacts',
  exposes: {
    './routes': './src/routes.tsx',
    './activityLog': './src/activityLogs/activityLog.tsx',
    './automation': './src/automations/automation.tsx',
    './contactDetailHeader': './src/customers/containers/LeadState',
    './selectRelation': './src/relation/SelectContacts'
  },
  routes: {
    url: 'http://localhost:3011/remoteEntry.js',
    scope: 'contacts',
    module: './routes'
  },
  activityLog: './activityLog',
  automation: './automation',
  selectRelation: './selectRelation',
  contactDetailHeader: './contactDetailHeader',
  menus: [
    {
      text: 'Contacts',
      url: '/contacts/customer',
      icon: 'icon-users',
      location: 'mainNavigation',
      permission: 'showCustomers'
    }
  ]
};
