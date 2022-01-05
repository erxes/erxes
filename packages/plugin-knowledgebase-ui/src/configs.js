module.exports = {
  name: "knowledgeBase",
  port: 3004,
  exposes: {
    "./routes": "./src/routes.tsx",
    // "./settings": "./src/Settings.tsx",
  },
  routes: {
    url: "http://localhost:3004/remoteEntry.js",
    scope: "knowledgeBase",
    module: "./routes",
  },
  menus: [
    {
      text: "Knowledge Base",
      url: "/knowledgeBase",
      icon: "icon-book-open",
      location: "mainNavigation",
    },
  ],
};