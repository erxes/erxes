module.exports = {
  srcDir: __dirname,
  name: "burenscoring",
  port: 3017,
  scope: "burenscoring",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./burenSection": "./src/containers/BurenSection.tsx",
    "./burenScoreSidebar": "./src/containers/DealBurenSection.tsx",
  },
  routes: {
    url: "http://localhost:3017/remoteEntry.js",
    scope: "burenscoring",
    module: "./routes",
  },
  menus: [
    {
      text: "BurenScorings",
      url: "/burenscorings",
      icon: "icon-star",
      location: "mainNavigation",
    },
    {
      text: "scoring config",
      to: "/erxes-plugin-burenscoring/config/Settings",
      image: "/images/icons/erxes-04.svg",
      location: "settings",
      scope: "burenscoring",
    },
  ],
  customerRightSidebarSection: "./burenSection",
  dealRightSidebarSection: {
    title: "ЗМС",
    component: "./burenScoreSidebar",
  },
};
