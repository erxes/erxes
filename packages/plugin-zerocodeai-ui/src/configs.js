module.exports = {
  name: "zerocodeai",
  scope: 'zerocodeai',
  port: 3014,
  exposes: {
    './routes': './src/routes.tsx',
    "./inboxConversationDetailActionBar": "./src/containers/ConversationDetailActionBar.tsx",
  },
  inboxConversationDetailActionBar: './inboxConversationDetailActionBar',
  menus: [
    {
      text: "Zerocode AI",
      url: "/zerocodeai/train",
      icon: "icon-lamp",
      location: "mainNavigation",
      permission: "zerocodeaiManage",
    },
    {
      text: 'Zerocode AI',
      to: '/zerocodeai/config',
      image: '/images/icons/erxes-18.svg',
      location: 'settings',
      scope: 'zerocodeai',
      action: 'zerocodeaiManage',
      permissions: ['zerocodeaiManage'],
    },
  ],
  routes: {
    url: 'http://localhost:3014/remoteEntry.js',
    scope: 'zerocodeai',
    module: './routes'
  }
};