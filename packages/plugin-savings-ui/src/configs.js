module.exports = {
  srcDir: __dirname,
  name: "savings",
  port: 3239,
  scope: 'savings',
  exposes: {
    "./routes": "./src/routes.tsx",
    "./contractSection":
      "./src/contracts/components/common/ContractSection.tsx",
  },
  routes: {
    url: "http://localhost:3239/remoteEntry.js",
    scope: "savings",
    module: "./routes",
  },
  menus: [
    {
      text: "Saving Contract",
      url: "/erxes-plugin-saving/contract-list",
      icon: "icon-piggybank",
      location: "mainNavigation",
      permissions: ["showContracts"],
      permission: "showContracts",
    },
    {
      text: "Saving Contract types",
      image: "/images/icons/erxes-01.svg",
      to: "/erxes-plugin-saving/contract-types/",
      action: "savingConfig",
      scope: "savings",
      location: "settings",
      permissions: ["showContracts"],
      permission: "showContracts",
    },
    {
      text: "Saving Transaction",
      image: "/images/icons/erxes-16.svg",
      to: "/erxes-plugin-saving/transaction-list",
      action: "transaction",
      scope: "savings",
      location: "transaction-list",
      permissions: ["showTransactions"],
    },
    {
      text: "Saving config",
      image: "/images/icons/erxes-16.svg",
      to: "/erxes-plugin-saving/saving-settings/",
      action: "savingConfig",
      scope: "savings",
      location: "settings",
      permissions: ["savingsManageSavingConfigs"],
      permission: "savingsManageSavingConfigs",
    },
  ],
  customerRightSidebarSection: [
    {
      text: "customerRightSidebarSection",
      component: "./contractSection",
      scope: "savings",
    },
  ],
  customerRightSidebarSection: "./contractSection",
};
