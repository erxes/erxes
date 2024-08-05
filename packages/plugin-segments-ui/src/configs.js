module.exports = {
  srcDir: __dirname,
  name: "segments",
  port: 3013,
  scope: "segments",
  exposes: {
    "./routes": "./src/routes.tsx",

    "./teamMemberSidebarComp": "./src/containers/SegmentFilter.tsx"
  },
  routes: {
    url: "http://localhost:3013/remoteEntry.js",
    scope: "segments",
    module: "./routes"
  },

  teamMemberSidebarComp: "./teamMemberSidebarComp",
  menus: [
    {
      text: "Segments",
      url: "/segments",
      icon: "icon-chart-pie-alt",
      location: "mainNavigation",
      permission: "showSegments"
    }
  ]
};
