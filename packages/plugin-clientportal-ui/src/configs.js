module.exports = {
  name: "clientportal",
  port: 3015,
  exposes: {
    "./routes": "./src/routes.tsx",
  },
  routes: {
    url: "http://localhost:3015/remoteEntry.js",
    scope: "clientportal",
    module: "./routes",
  },
  menus: [
    {
      text: "Client Portal",
      to: "/settings/client-portal",
      image: "/images/icons/erxes-32.png",
      location: "settings",
      scope: "clientportal",
      action: "",
      permissions: [],
    },
  ],
};
