module.exports = {
  name: "filemanager",
  scope: "filemanager",
  port: 3020,
  exposes: {
    "./routes": "./src/routes.tsx"
  },
  routes: {
    url: "http://localhost:3020/remoteEntry.js",
    scope: "filemanager",
    module: "./routes",
  },
  menus: [
    {
      text: "File Manager",
      url: "/filemanager",
      icon: 'icon-folder-1',
      location: "mainNavigation",
    }
  ],
};