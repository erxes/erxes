module.exports = {
  srcDir: __dirname,
  name: 'bid',
  port: 3037,
  scope: 'bid',
  exposes: {
    './routes': './src/routes.tsx',
    "./customerSidebar": "./src/CustomerSidebar.tsx",
    './extendSystemConfig': './src/components/Configs.tsx'
  },
  routes: {
    url: 'http://localhost:3037/remoteEntry.js',
    scope: 'bid',
    module: './routes'
  },
  extendSystemConfig: './extendSystemConfig',
  conversationDetailSidebar: './customerSidebar',
  menus:[],
  customerRightSidebarSection: [
    {
      text: "customerSection",
      component: "./customerSidebar",
      scope: "bid",
    },
  ],

};
