module.exports = {
  srcDir: __dirname,
  name: "activity",
  port: 3210,
  scope: "activity",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3210/remoteEntry.js",
    scope: "activity",
    module: "./routes",
  },
  menus: [
    {
      text: "Activity",
      to: "/activity",
      location: "settings",
      image: "/images/icons/erxes-21.svg",
      scope: "activity",
    },
  ],
};
