module.exports = {
  name: "notifications",
  port: 3014,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/containers/Widget.tsx",
  },
  routes: {
    url: "http://localhost:3014/remoteEntry.js",
    scope: "notifications",
    module: "./routes",
  },
  menus: [
    {
      text: "notifications",
      url: "/notifications",
      icon: "icon-book-open",
      location: "topNavigation",
<<<<<<< HEAD
      scope: "notifications",
      component: "./settings",
=======
>>>>>>> cc476736c0b3ebfa7b1690b6135320204f61ed73
    },
  ],
};
