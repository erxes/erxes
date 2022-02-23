module.exports = {
  name: 'tags',
  port: 3012,
  exposes: {
    './routes': './src/routes.tsx'
  },
  routes: {
    url: 'http://localhost:3012/remoteEntry.js',
    scope: 'tags',
    module: './routes'
  },
  menus: [
    {
      text: 'Tags',
      url: '/tags/conversation',
      icon: 'icon-tag-alt',
      location: 'mainNavigation',
      permission: 'showTags',
    }
  ]
};
