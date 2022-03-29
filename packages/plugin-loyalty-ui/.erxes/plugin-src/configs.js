module.exports = {
  name: "loyalty",
  port: 3002,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./sidebar": "./src/containers/Sidebar.tsx",
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
  customerRightSidebarSection: {
    text: "customerSection",
    component: "./sidebar",
    scope: "loyalty",
  },
  companyRightSidebarSection: {
    text: "companySection",
    component: "./sidebar",
    scope: "loyalty",
  },
  userRightSidebarSection: {
    text: "userSection",
    component: "./sidebar",
    scope: "loyalty",
  },
};
