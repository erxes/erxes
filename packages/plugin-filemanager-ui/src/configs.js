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
      text: "filemanager",
      to: "/settings/filemanager",
      image: "/images/icons/erxes-09.svg",
      location: "settings",
      scope: "filemanager",
    },
  ],
};