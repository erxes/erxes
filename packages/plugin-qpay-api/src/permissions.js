module.exports = {
  qpay: {
    name: "qpay",
    description: "QPAY",
    actions: [
      {
        name: "qpayAll",
        description: "All",
        use: ["manageQr", "allQr"],
      },
      {
        name: "manageQr",
        description: "Manage QR",
      },
      {
        name: "allQr",
        description: "All QR",
      },
    ],
  },
};
