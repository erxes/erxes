module.exports = {
  name: 'accounts',
  port: 3017,
  scope: 'accounts',
  exposes: {
    './routes': './src/routes.tsx',
    './extendFormField':
      './src/containers/accountCategory/SelectAccountCategory.tsx',
    './extendFormFieldChoice': './src/components/account/FormFieldChoice.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'accounts',
    module: './routes'
  },
  extendFormField: './extendFormField',
  extendFormFieldChoice: './extendFormFieldChoice',
  menus: [
    {
      text: 'Account',
      to: '/settings/account/',
      image: '/images/icons/erxes-31.png',
      location: 'settings',
      scope: 'accounts',
      action: 'accountsAll',
      permissions: ['showAccounts', 'manageAccounts']
    }
  ]
};
