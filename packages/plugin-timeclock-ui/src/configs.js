module.exports = {
  srcDir: __dirname,
  name: "timeclock",
  port: 3225,
  scope: "timeclock",
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3225/remoteEntry.js",
    scope: "timeclock",
    module: "./routes",
  },
  menus: [
    {
      text: "Timeclocks",
      url: "/timeclocks",
      icon: "icon-star",
      location: "mainNavigation",
    },
  ],
};
