module.exports = {
  srcDir: __dirname,
  name: "grants",
  port: 3129,
  scope: "grants",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./cardSideBarSection": "./src/section/containers/Section.tsx",
  },
  routes: {
    url: "http://localhost:3129/remoteEntry.js",
    scope: "grants",
    module: "./routes",
  },
  menus: [
    {
      text: "Grants",
      url: "/grants/requests",
      icon: "icon-followers",
      location: "mainNavigation",
    },
    {
      text: "Grants Configs",
      to: "/settings/grants-configs",
      image: "/images/icons/erxes-18.svg",
      location: "settings",
      scope: "grants",
    },
  ],
  dealRightSidebarSection: {
    title: "Grants",
    component: "./cardSideBarSection",
  },

  ticketRightSidebarSection: "./cardSideBarSection",
  taskRightSidebarSection: "./cardSideBarSection",
};
