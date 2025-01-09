module.exports = {
  srcDir: __dirname,
  name: "sales",
  port: 3020,
  scope: "sales",
  url: "http://localhost:3020/remoteEntry.js",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./settings": "./src/Settings.tsx",
    "./propertyGroupForm": "./src/propertyGroupForm.tsx",
    "./segmentForm": "./src/segmentForm.tsx",
    "./activityLog": "./src/activityLogs/activityLog.tsx",
    "./automation": "./src/automations/automation.tsx",
    "./contactDetailRightSidebar": "./src/RightSidebar.tsx",
    "./selectRelation": "./src/common/SelectRelation.tsx",
    "./invoiceDetailRightSection": "./src/common/Item.tsx"
  },
  routes: {
    url: "http://localhost:3020/remoteEntry.js",
    scope: "sales",
    module: "./routes"
  },
  propertyGroupForm: "./propertyGroupForm",
  segmentForm: "./segmentForm",
  activityLog: "./activityLog",
  automation: "./automation",
  contactDetailRightSidebar: "./contactDetailRightSidebar",
  invoiceDetailRightSection: "./invoiceDetailRightSection",
  selectRelation: "./selectRelation",
  menus: [
    {
      text: "Sales Pipeline",
      url: "/deal",
      icon: "icon-piggy-bank",
      location: "mainNavigation",
      permission: "showDeals"
    },
    {
      text: "Sales Pipelines",
      to: "/settings/boards/deal",
      image: "/images/icons/erxes-25.png",
      location: "settings",
      scope: "sales",
      action: "dealsAll",
      permissions: [
        "dealBoardsAdd",
        "dealBoardsEdit",
        "dealBoardsRemove",
        "dealPipelinesAdd",
        "dealPipelinesEdit",
        "dealPipelinesUpdateOrder",
        "dealPipelinesRemove",
        "dealPipelinesArchive",
        "dealPipelinesArchive",
        "dealStagesAdd",
        "dealStagesEdit",
        "dealStagesUpdateOrder",
        "dealStagesRemove"
      ]
    }
  ]
};
