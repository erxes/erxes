module.exports = {
  srcDir: __dirname,
  name: "clientportal",
  port: 3015,
  scope: "clientportal",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./cardDetailAction": "./src/containers/comments/CardDetailAction.tsx",
    "./fieldConfig": "./src/containers/FieldConfigForm.tsx",
    "./vendorSection":
      "./src/containers/cardsRightSidebarSection/VendorSection.tsx",
    "./clientSection":
      "./src/containers/cardsRightSidebarSection/ClientSection.tsx",
  },
  cardDetailAction: "./cardDetailAction",
  fieldConfig: "./fieldConfig",
  routes: {
    url: "http://localhost:3015/remoteEntry.js",
    scope: "clientportal",
    module: "./routes",
  },
  menus: [
    {
      text: "Business Portal",
      to: "/settings/business-portal",
      image: "/images/icons/erxes-32.png",
      location: "settings",
      scope: "businessportal",
      action: "",
      permissions: [],
    },
  ],
  // taskRightSidebarSection: "./clientSection",
  taskRightSidebarSection: "./vendorSection",
  // ticketRightSidebarSection: "./clientSection",
  ticketRightSidebarSection: "./vendorSection",
  // dealRightSidebarSection: "./clientSection",
  dealRightSidebarSection: "./vendorSection",
};
