module.exports = {
  srcDir: __dirname,
  name: "clientportal",
  port: 3015,
  scope: "clientportal",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./cardDetailAction": "./src/containers/comments/CardDetailAction.tsx",
    "./fieldConfig": "./src/containers/FieldConfigForm.tsx",
    "./clientPortalSection":
      "./src/containers/cardsRightSidebarSection/VendorSection.tsx",
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
  taskRightSidebarSection: "./clientPortalSection",
  ticketRightSidebarSection: "./clientPortalSection",
  dealRightSidebarSection: "./clientPortalSection",
};
