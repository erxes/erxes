module.exports = {
    cars: {
      name: "cars",
      description: "Cars",
      actions: [
        {
          name: "all",
          description: "All",
          use: ["showCars", "manageCars"],
        },
        {
          name: "showCars",
          description: "Show cars",
        },
        {
          name: "manageCars",
          description: "Manage cars",
        },
      ],
    },

    topups: {
      name: "topups",
      description: "Topups",
      actions: [
        {
          name: "all",
          description: "All",
          use: ["showTopups", "manageTopups"],
        },
        {
          name: "showTopups",
          description: "Show topups",
        },
        {
          name: "manageTopups",
          description: "Manage topups",
        },
      ],
    }
  };
  