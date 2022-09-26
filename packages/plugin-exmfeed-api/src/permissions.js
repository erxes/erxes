module.exports = {
  engages: {
    name: "exmfeed",
    description: "Exm feed",
    actions: [
      { name: "showExmActivityFeed", description: "Show exm activity feed" },
      {
        name: "manageExmActivityFeed",
        description: "Manage exm activity feed",
      },
      {
        name: "exmActivityFeedAll",
        description: "All",
        use: ["showExmActivityFeed", "manageExmActivityFeed"],
      },
    ],
  },
};
