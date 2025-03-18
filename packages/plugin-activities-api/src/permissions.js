module.exports = {
  activities: {
    name: "activities",
    description: "Activites",
    actions: [
      {
        name: "activitiesAll",
        description: "All",
        use: [
          "showActivities",
          "addActivity",
          "editActivity",
          "removeActivity",
        ],
      },
      {
        name: "showActivities",
        description: "Show activity",
      },
      {
        name: "addActivity",
        description: "Add activity",
      },
      {
        name: "editActivity",
        description: "Edit activity",
      },
      {
        name: "removeActivity",
        description: "Remove activity",
      },
    ],
  },
};
