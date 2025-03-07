module.exports = {
  automations: {
    name: "programs",
    description: "Programs",
    actions: [
      {
        name: "programsAll",
        description: "All",
        use: ["showPrograms", "programsAdd", "programsEdit", "programsRemove"],
      },
      {
        name: "showPrograms",
        description: "Show program",
      },
      {
        name: "programsAdd",
        description: "Add program",
      },
      {
        name: "programsEdit",
        description: "Edit program",
      },
      {
        name: "programsRemove",
        description: "Remove program",
      },
    ],
  },
};
