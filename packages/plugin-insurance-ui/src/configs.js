module.exports = {
  srcDir: __dirname,
  name: 'insurance',
  port: 3017,
  scope: 'insurance',
  exposes: {
    './routes': './src/routes.tsx',
    './cardDetailAction': './src/modules/items/ContractButton.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'insurance',
    module: './routes',
  },

  cardDetailAction: "./cardDetailAction",
  menus: [
    {
      text: 'Insurance',
      url: '/insurance/risks',
      icon: 'icon-umbrella',
      location: 'mainNavigation',
    }
  ],
};
