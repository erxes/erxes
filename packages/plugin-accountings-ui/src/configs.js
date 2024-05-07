module.exports = {
  srcDir: __dirname,
  name: 'accountings',
  port: 3032,
  scope: 'accountings',
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3032/remoteEntry.js',
    scope: 'accountings',
    module: './routes'
  },
  menus: [
    {
      text: 'Accounts',
      to: '/accountings/accounts',
      image: '/images/icons/erxes-31.png',
      location: 'settings',
      scope: 'accountings',
      action: 'accounts',
      permissions: ["showAccounts", "manageAccounts"],
    },
    {
      text: 'Configs of Accountings',
      to: '/accountings/accounts',
      image: '/images/icons/erxes-31.png',
      location: 'settings',
      scope: 'accountings',
      action: 'accounts',
      permissions: ["showAccounts", "manageAccounts"],
    }
  ]
};
