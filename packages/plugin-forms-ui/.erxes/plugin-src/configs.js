module.exports = {
  name: "properties",
  port: 3005,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3005/remoteEntry.js",
    scope: "properties",
    module: "./routes",
  },
  menus: [
    {
      text: "Properties",
      to: "/settings/properties",
      image: "/images/icons/erxes-01.svg",
      location: "settings",
      scope: "properties",
    },
  ],
};