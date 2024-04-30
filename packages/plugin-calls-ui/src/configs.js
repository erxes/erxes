module.exports = {
  srcDir: __dirname,
  name: "calls",
  port: 3017,
  scope: "calls",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./call": "./src/containers/SipProvider.tsx",
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
    "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx",
    "./integrationCustomActions": "./src/components/TokenButton.tsx",
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
  },

  routes: {
    url: "http://localhost:3017/remoteEntry.js",
    scope: "calls",
    module: "./routes",
  },
  innerWidget: {
    url: "http://localhost:3017/remoteEntry.js",
    scope: "calls",
    module: "./call",
    style: "bottom: 80px;right: 12px",
  },
  inboxIntegrationForm: "./inboxIntegrationForm",
  invoiceDetailRightSection: "./invoiceDetailRightSection",
  integrationDetailsForm: "./integrationDetailsForm",
  integrationCustomActions: "./integrationCustomActions",
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxIntegrations: [
    {
      name: "Grand stream",
      description: "Configure Grand stream device",
      isAvailable: true,
      kind: "calls",
      logo: "/images/integrations/grandstream.png",
      createModal: "grandstream",
    },
  ],
};
