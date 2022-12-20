module.exports = {
  name: "apex",
  scope: "apex",
  port: 3020,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3020/remoteEntry.js",
    scope: "apex",
    module: "./routes",
  },
  menus: [
    {
      text: "Reports",
      to: "/settings/apexreports",
      image: "/images/icons/erxes-09.svg",
      location: "settings",
      scope: "apex",
      permissions: ['manageApexReports'],
    },
  ],
};