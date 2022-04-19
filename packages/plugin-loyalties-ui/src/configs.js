module.exports = {
  name: "loyalties",
  port: 3002,
  exposes: {
    "./routes": "./src/routes.tsx",
    "./customerSidebar": "./src/containers/CustomerSidebar.tsx",
    "./companySidebar": "./src/containers/CompanySidebar.tsx",
    "./userSidebar": "./src/containers/UserSidebar.tsx",
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
      permissions: ["manageLoyalties", "showLoyalties"],
    },
  ],
  customerRightSidebarSection: [
    {
      text: "customerSection",
      component: "./customerSidebar",
      scope: "loyalties",
    },
  ],
  companyRightSidebarSection: [
    {
      text: "companySection",
      component: "./companySidebar",
      scope: "loyalties",
    },
  ],
  userRightSidebarSection: [
    {
      text: "userSection",
      component: "./userSidebar",
      scope: "loyalties",
    },
  ],
};
