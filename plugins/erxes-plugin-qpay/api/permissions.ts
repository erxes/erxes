export default [
  { name: "showQpay", description: "Show qpay" },
  { name: "manageQpay", description: "Manage qpay" },
  {
    name: "allQpay",
    description: "All",
    use: ["showQpay", "manageQpay"],
  },
];
