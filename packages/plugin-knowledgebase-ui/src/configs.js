module.exports = {
  srcDir: __dirname,
  name: 'knowledgebase',
  port: 3004,
  scope: 'knowledgebase',
  exposes: {
    './routes': './src/routes.tsx',
    './automation': './src/automation.tsx'
  },
  routes: {
    url: 'http://localhost:3004/remoteEntry.js',
    scope: 'knowledgebase',
    module: './routes'
  },
  automation: './automation',
  menus: [
    {
      text: 'Knowledge Base',
      url: '/knowledgeBase',
      icon: 'icon-book-open',
      location: 'mainNavigation',
      permission: 'showKnowledgeBase'
    }
  ]
};
