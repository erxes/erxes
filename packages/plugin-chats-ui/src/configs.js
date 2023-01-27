module.exports = {
  name: 'chats',
  port: 3110,
  exposes: {
    './routes': './src/routes.tsx',
    './widget': './src/components/Widget.tsx'
  },
  widget: './widget',
  routes: {
    url: 'http://localhost:3110/remoteEntry.js',
    scope: 'chats',
    module: './routes'
  },
  menus: [
    {
      text: 'Chat Widget',
      url: '/erxes-plugin-chat/widget',
      icon: 'icon-chat-1',
      location: 'topNavigation',
      scope: 'chats',
      component: './widget'
    },
    {
      text: 'Chat',
      url: '/erxes-plugin-chat',
      icon: 'icon-chat-1',
      location: 'mainNavigation',
      permission: 'showChats'
    }
  ]
};
