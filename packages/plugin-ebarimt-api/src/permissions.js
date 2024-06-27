module.exports = {
  ebarimt: {
    name: "ebarimt",
    description: "Ebarimt",
    actions: [
      {
        name: "ebarimtAll",
        description: "All",
        use: ["managePutResponses", "syncEbarimtConfig", "specialReturnBill", "reReturnBill"],
      },
      {
        name: "managePutResponses",
        description: "Manage Put responses",
      },
      {
        name: "syncEbarimtConfig",
        description: "Manage ebarimt config",
      },
      {
        name: "specialReturnBill",
        description: "Return bill only",
      },
      {
        name: "reReturnBill",
        description: "Re Return bill",
      },
    ],
  },
};
