module.exports = {
  srcDir: __dirname,
  name: "loans",
  port: 3227,
  exposes: {
    "./routes": "./src/routes.tsx",
    // './settings': './src/Settings.tsx',
    "./contractSection":
      "./src/contracts/components/common/ContractSection.tsx",
  },
  routes: {
    url: "http://localhost:3120/remoteEntry.js",
    scope: "loans",
    module: "./routes",
  },
  menus: [
    {
      text: "Loan Contract",
      url: "/erxes-plugin-loan/contract-list",
      icon: "icon-medal",
      location: "mainNavigation",
      permissions: ["showContracts"],
      permission: "showContracts",
    },
    {
      text: "Contract types",
      image: "/images/icons/erxes-01.svg",
      to: "/erxes-plugin-loan/contract-types/",
      action: "loanConfig",
      scope: "loans",
      location: "settings",
      permissions: ["showContracts"],
      permission: "showContracts",
    },
    {
      text: "Insurance types",
      image: "/images/icons/erxes-13.svg",
      to: "/erxes-plugin-loan/insurance-types/",
      action: "loanConfig",
      scope: "loans",
      location: "settings",
      permissions: ["manageInsuranceTypes"],
      permission: "manageInsuranceTypes",
    },
    {
      text: "Loan config",
      image: "/images/icons/erxes-16.svg",
      to: "/erxes-plugin-loan/holiday-settings/",
      action: "loanConfig",
      scope: "loans",
      location: "settings",
      permissions: ["manageLoanConfigs"],
      permission: "manageLoanConfigs",
    },
    {
      text: "Transaction",
      image: "/images/icons/erxes-16.svg",
      to: "/erxes-plugin-loan/transaction-list",
      action: "transaction",
      scope: "loans",
      location: "transaction-list",
      permissions: ["showTransactions"],
    },
    {
      text: "nonBalanceTransaction",
      image: "/images/icons/erxes-16.svg",
      to: "/erxes-plugin-loan/non-balance-transactions",
      action: "nonBalanceTransaction",
      scope: "loans",
      location: "non-balance-transactions",
      permissions: ["showNonBalanceTransactions"],
    },
  ],
  customerRightSidebarSection: "./contractSection",
  companyRightSidebarSection: "./contractSection",
  dealRightSidebarSection: "./contractSection",
};
