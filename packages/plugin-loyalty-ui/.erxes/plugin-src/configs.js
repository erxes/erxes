module.exports = {
  name: "loyalty",
  port: 3002,
  exposes: {
    "./routes": "./src/routes.tsx",
    // "./settings": "./src/containers/Widget.tsx",
  },
  routes: {
    url: "http://localhost:3002/remoteEntry.js",
    scope: "loyalty",
    module: "./routes",
  },
  menus: [
    {
    text: 'Loyalty',
    url: '/vouchers',
    icon: 'icon-piggybank',
    location: "mainNavigation",
    permission: 'showLoyalties'
  },
  {
    text: 'Loyalty config',
    to: '/erxes-plugin-loyalty/settings/general',
    image: '/images/icons/erxes-16.svg',
    location: "settings",
    scope: "loyalty",
    action: 'loyaltyConfig',
    permissions: ['loyaltyConfig'],
  }
],
};
