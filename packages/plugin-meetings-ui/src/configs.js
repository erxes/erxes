module.exports = {
  srcDir: __dirname,
  name: "meetings",
  port: 3121,
  scope: "meetings",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./meetingSideBarSection": "./src/DealRoute.tsx",
  },
  routes: {
    url: "http://localhost:3121/remoteEntry.js",
    scope: "meetings",
    module: "./routes",
  },
  menus: [
    {
      text: "Meetings",
      url: "/meetings/myCalendar",
      icon: "icon-calender",
      location: "mainNavigation",
    },
  ],
  dealRightSidebarSection: {
    title: "Meeting",
    component: "./meetingSideBarSection",
  },
};
