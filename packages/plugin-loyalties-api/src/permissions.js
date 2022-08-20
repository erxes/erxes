module.exports = {
  loyalties: {
    name: "loyalties",
    description: "Loyalties",
    actions: [
      {
        name: "loyaltyAll",
        description: "All",
        use: ["showLoyalties", "manageLoyalties"],
      },
      {
        name: "showLoyalties",
        description: "Show loyalties",
      },
      {
        name: "manageLoyalties",
        description: "Manage loyalties",
      },
    ],
  },
};
