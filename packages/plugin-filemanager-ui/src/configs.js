module.exports = {
  name: "filemanager",
  scope: "filemanager",
  port: 3060,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3060/remoteEntry.js",
    scope: "filemanager",
    module: "./routes",
  },
  menus: [
    {
      text: "File Manager",
      url: "/filemanager",
      icon: "icon-folder-1",
      location: "mainNavigation",
      permissions: ['showFileManager'],
    },
  ],
};
