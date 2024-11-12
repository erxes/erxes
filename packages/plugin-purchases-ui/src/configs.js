module.exports = {
  srcDir: __dirname,
  name: "purchases",
  port: 3021,
  scope: "purchases",
  url: "http://localhost:3021/remoteEntry.js",
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
    url: "http://localhost:3021/remoteEntry.js",
    scope: "purchases",
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
      text: "Purchases Pipeline",
      url: "/purchase",
      icon: "icon-bag-alt",
      location: "mainNavigation",
      permission: "showPurchases"
    },
    {
      text: "Purchases Pipelines",
      to: "/settings/boards/purchase",
      image: "/images/icons/erxes-25.png",
      location: "settings",
      scope: "purchases",
      action: "purchasesAll",
      permissions: [
        "purchaseBoardsAdd",
        "purchaseBoardsEdit",
        "purchaseBoardsRemove",
        "purchasePipelinesAdd",
        "purchasePipelinesEdit",
        "purchasePipelinesUpdateOrder",
        "purchasePipelinesRemove",
        "purchasePipelinesArchive",
        "purchasePipelinesArchive",
        "purchaseStagesAdd",
        "purchaseStagesEdit",
        "purchaseStagesUpdateOrder",
        "purchaseStagesRemove"
      ]
    }
  ]
};
