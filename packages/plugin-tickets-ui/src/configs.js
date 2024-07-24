module.exports = {
  srcDir: __dirname,
  name: "tickets",
  port: 3033,
  scope: "tickets",
  url: "http://localhost:3033/remoteEntry.js",
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
    url: "http://localhost:3033/remoteEntry.js",
    scope: "tickets",
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
      text: "Tickets Pipeline",
      url: "/ticket",
      icon: "icon-bag-alt",
      location: "mainNavigation",
      permission: "showTickets"
    },
    {
      text: "Tickets Pipelines",
      to: "/settings/boards/ticket",
      image: "/images/icons/erxes-25.png",
      location: "settings",
      scope: "tickets",
      action: "ticketsAll",
      permissions: [
        "ticketBoardsAdd",
        "ticketBoardsEdit",
        "ticketBoardsRemove",
        "ticketPipelinesAdd",
        "ticketPipelinesEdit",
        "ticketPipelinesUpdateOrder",
        "ticketPipelinesRemove",
        "ticketPipelinesArchive",
        "ticketPipelinesArchive",
        "ticketStagesAdd",
        "ticketStagesEdit",
        "ticketStagesUpdateOrder",
        "ticketStagesRemove"
      ]
    }
  ]
};
