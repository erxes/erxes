module.exports = {
  name: "knowledgebase",
  port: 3004,
  exposes: {
    "./routes": "./src/routes.tsx"
  },
  routes: {
    url: "http://localhost:3004/remoteEntry.js",
    scope: "knowledgebase",
    module: "./routes",
  },
  menus: [
    {
      text: 'Knowledge Base',
      url: '/knowledgeBase',
      icon: 'icon-book-open',
      location: "mainNavigation",
      permission: "showKnowledgeBase",
    }
  ],
};