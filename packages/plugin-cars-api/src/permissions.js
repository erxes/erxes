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
};
