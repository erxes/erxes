module.exports = {
  segments: {
    name: "segments",
    description: "Segments",
    actions: [
      {
        name: "segmentsAll",
        description: "All",
        use: ["showSegments", "manageSegments"],
      },
      {
        name: "manageSegments",
        description: "Manage segments",
      },
      {
        name: "showSegments",
        description: "Show segments list",
      },
    ],
  },
}