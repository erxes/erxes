module.exports = {
  srcDir: __dirname,
  name: 'aputpm',
  scope: 'aputpm',
  port: 3020,
  exposes: {
    './routes': './src/routes.tsx',
    './selectKbCategory': './src/common/SelectKBCategories.tsx'
  },
  routes: {
    url: 'http://localhost:3020/remoteEntry.js',
    scope: 'aputpm',
    module: './routes'
  },
  formsExtraFields: [
    {
      scope: 'aputpm',
      component: './selectKbCategory',
      type: 'kbCategory'
    }
  ],
  menus: [
    {
      text: 'APU TPM',
      to: '/settings/safety_tips',
      image: '/images/icons/erxes-09.svg',
      location: 'settings',
      scope: 'aputpm'
    }
  ]
};
