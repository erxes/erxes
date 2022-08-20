module.exports = {
  name: "rentpay",
  port: 4011,
  scope: "rentpay",
  url: "http://localhost:4011/remoteEntry.js",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./buyerSection": "./src/BuyerSection.tsx",
    "./waiterSection": "./src/WaiterSection.tsx",
  },
  routes: {
    url: "http://localhost:4011/remoteEntry.js",
    scope: "rentpay",
    module: "./routes",
  },
  dealRightSidebarSection: [
    {
      text: "buyerSection",
      component: "./buyerSection",
      scope: "rentpay",
    },
    {
      text: "waiterSection",
      component: "./waiterSection",
      scope: "rentpay",
    },
  ],
  menus: [],
};
