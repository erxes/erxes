module.exports = {
  srcDir: __dirname,
  name: "tasks",
  port: 3044,
  scope: "tasks",
  url: "http://localhost:3044/remoteEntry.js",
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
    url: "http://localhost:3044/remoteEntry.js",
    scope: "tasks",
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
      text: "Tasks Pipeline",
      url: "/task",
      icon: "icon-bag-alt",
      location: "mainNavigation",
      permission: "showTasks"
    },
    {
      text: "Tasks Pipelines",
      to: "/settings/boards/task",
      image: "/images/icons/erxes-25.png",
      location: "settings",
      scope: "tasks",
      action: "tasksAll",
      permissions: [
        "taskBoardsAdd",
        "taskBoardsEdit",
        "taskBoardsRemove",
        "taskPipelinesAdd",
        "taskPipelinesEdit",
        "taskPipelinesUpdateOrder",
        "taskPipelinesRemove",
        "taskPipelinesArchive",
        "taskPipelinesArchive",
        "taskStagesAdd",
        "taskStagesEdit",
        "taskStagesUpdateOrder",
        "taskStagesRemove"
      ]
    }
  ]
};
