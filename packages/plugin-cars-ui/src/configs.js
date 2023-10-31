module.exports = {
  name: "cars",
  port: 3010,
  scope: 'cars',
  exposes: {
    "./routes": "./src/routes.tsx",
    "./customerSidebar": "./src/sidebars/CustomerSidebar.tsx",
    "./companySidebar": "./src/sidebars/CompanySidebar.tsx",
    "./dealSidebar": "./src/sidebars/DealSidebar.tsx",
    "./selectRelation": "./src/containers/SelectRelation.tsx"
  },
  routes: {
    url: "http://localhost:3010/remoteEntry.js",
    scope: "cars",
    module: "./routes",
  },
  selectRelation: "./selectRelation",
  menus: [
    {
      text: "Plugin Car",
      url: "/cars",
      location: "mainNavigation",
      icon: "icon-car",
      permission: "showCars",
    },
  ],
  customerRightSidebarSection: [
    {
      text: "customerSection",
      component: "./customerSidebar",
      scope: "cars",
    },
  ],
  companyRightSidebarSection: [
    {
      text: "companySection",
      component: "./companySidebar",
      scope: "cars",
    },
  ],
  dealRightSidebarSection: [
    {
      text: "dealSection",
      component: "./dealSidebar",
      scope: "cars",
    },
  ],
};
