module.exports = {
  srcDir: __dirname,
  name: "tumentech",
  port: 3023,
  scope: "tumentech",
  url: "http://localhost:3023/remoteEntry.js",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./participantsSection": "./src/Participants.tsx",
    "./locationSection": "./src/DealRoute.tsx",
    "./carSection": "./src/components/common/CarSection.tsx",
    "./accountSection": "./src/CustomerAccount.tsx",
  },
  routes: {
    url: "http://localhost:3023/remoteEntry.js",
    scope: "tumentech",
    module: "./routes"
  },
  menus: [
    {
      text: "Tumentech",
      url: "/erxes-plugin-tumentech/car/list",
      icon: "icon-car",
      location: "mainNavigation",
      permission: "showCars"
    },
    {
      text: 'Topup account',
      url: '/erxes-plugin-tumentech/topup',
      icon: 'icon-dollar-sign',
      location: 'mainNavigation',
      permission: ''
    }
  ],
  customerRightSidebarSection: [
    {
      text: "customerAccountSection",
      component: "./carSection",
      scope: "tumentech"
    },
    {
      text: "customerSection",
      component: "./accountSection",
      scope: "tumentech"
    }
  ],
  companyRightSidebarSection: [
    {
      text: "companySection",
      component: "./carSection",
      scope: "tumentech"
    }
  ],
  dealRightSidebarSection: [
    {
      text: "locationSection",
      component: "./locationSection",
      scope: "tumentech"
    },
    {
      text: "carSection",
      component: "./carSection",
      scope: "tumentech"
    },
    {
      text: "participantsSection",
      component: "./participantsSection",
      scope: "tumentech"
    }
  ]
};