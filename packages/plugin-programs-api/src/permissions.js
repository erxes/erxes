module.exports = {
  automations: {
    name: "program",
    description: "Program",
    actions: [
      {
        name: "ProgramAll",
        description: "All",
        use: ["showProgram", "programAdd", "programEdit", "programRemove"],
      },
      {
        name: "showProgram",
        description: "Show program",
      },
      {
        name: "programAdd",
        description: "Add program",
      },
      {
        name: "programEdit",
        description: "Edit program",
      },
      {
        name: "programRemove",
        description: "Remove program",
      },
    ],
  },
};
