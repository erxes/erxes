module.exports = {
  name: "logs",
  port: 3040,
  exposes: { "./routes": "./src/routes.tsx" },
  routes: {
    url: "http://localhost:3040/remoteEntry.js",
    scope: "logs",
    module: "./routes",
  },
  menus: [
    {
      text: "logs",
      to: "/settings/logs",
      image: "/images/icons/erxes-33.png",
      location: "settings",
      scope: "logs",
      component: "./settings",
      action: "",
      permissions: [],
    },
    {
      text: 'Email Deliveries',
      to: '/settings/emailDelivery',
      image: '/images/icons/erxes-27.png',
      location: 'settings',
      scope: 'logs',
      component: './settings',
      action: '',
      permissions: []
    }
  ],
};
