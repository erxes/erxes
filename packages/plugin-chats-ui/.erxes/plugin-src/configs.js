module.exports = {
  name: 'chats',
  port: 3110,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3110/remoteEntry.js',
    scope: 'chats',
    module: './routes'
  },
  menus: [
    {
      text: 'Chat',
      url: '/erxes-plugin-chat/home',
      icon: 'icon-cog',
      location: 'mainNavigation',
      permission: 'showChats'
    }
  ]
};
