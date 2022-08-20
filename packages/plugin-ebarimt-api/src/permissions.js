module.exports = {
  ebarimt: {
    name: "ebarimt",
    description: "Ebarimt",
    actions: [
      {
        name: "ebarimtAll",
        description: "All",
        use: ["managePutResponses", "syncEbarimtConfig"],
      },
      {
        name: "managePutResponses",
        description: "Manage Put responses",
      },
      {
        name: "syncEbarimtConfig",
        description: "Manage ebarimt config",
      },
    ],
  },
};
