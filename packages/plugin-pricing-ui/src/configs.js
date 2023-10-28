module.exports = {
  name: "pricing",
  port: 3023,
  scope: "pricing",
  exposes: {
    "./routes": "./src/routes.tsx"
  },
  routes: {
    url: "http://localhost:3023/remoteEntry.js",
    scope: "pricing",
    module: "./routes"
  },
  menus: [
    {
      text: "Pricing",
      to: "/pricing/plans",
      image: "/images/icons/erxes-06.svg",
      location: "settings",
      scope: "pricing",
      action: "allPricing",
      permissions: ["showPricing", "managePricing"],
    }
  ]
};
