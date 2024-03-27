module.exports = {
  srcDir: __dirname,
  name: "multierkhet",
  port: 3030,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./response": "./src/response.tsx",
  },
  routes: {
    url: "http://localhost:3030/remoteEntry.js",
    scope: "multierkhet",
    module: "./routes",
  },
  menus: [
    {
      text: "Sync Multi Erkhet",
      to: "/erxes-plugin-multi-erkhet/settings/general",
      image: "/images/icons/erxes-04.svg",
      location: "settings",
      scope: "multierkhet",
      action: "multiErkhetConfig",
      permission: "multiErkhetConfig",
    },
    {
      text: "Multi Erkhet Sync",
      url: "/multi-erkhet-history",
      icon: "book-alt",
      location: "mainNavigation",
      scope: "multierkhet",
      permission: "multiErkhetConfig",
    },
  ],
  layout: {
    url: "http://localhost:3030/remoteEntry.js",
    scope: "multierkhet",
    module: "./response",
  },
};
