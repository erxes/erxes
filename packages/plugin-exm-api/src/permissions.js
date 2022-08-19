module.exports = {
  exm: {
    name: "exm",
    description: "Exm core",
    actions: [
      { name: "showExms", description: "Show exm" },
      { name: "manageExms", description: "Manage exm" },
      {
        name: "exmsAll",
        description: "All",
        use: ["showExms", "manageExms"],
      },
    ],
  },
};
