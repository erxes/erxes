module.exports = {
  name: "loyalties",
  port: 3002,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./sidebar": "./src/containers/Sidebar.tsx",
  },
  routes: {
    url: "http://localhost:3002/remoteEntry.js",
    scope: "loyalties",
    module: "./routes",
  },
  menus: [
    {
      text: "Loyalties",
      url: "/vouchers",
      icon: "icon-piggybank",
      location: "mainNavigation",
      permission: "showLoyalties",
    },
    {
      text: "Loyalties config",
      to: "/erxes-plugin-loyalty/settings/general",
      image: "/images/icons/erxes-16.svg",
      location: "settings",
      scope: "loyalties",
      action: "loyaltyConfig",
      permissions: ["loyaltyConfig"],
    },
  ],
  customerRightSidebarSection: [
    {
      text: "customerSection",
      component: "./sidebar",
      scope: "loyalties",
    },
  ],
  companyRightSidebarSection: [
    {
      text: "companySection",
      component: "./sidebar",
      scope: "loyalties",
    },
  ],
  userRightSidebarSection: [
    {
      text: "userSection",
      component: "./sidebar",
      scope: "loyalties",
    },
  ],
};
