module.exports = {
  srcDir: __dirname,
  name: "calls",
  port: 3119,
  scope: "calls",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./call": "./src/containers/SipProvider.tsx",
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
    "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx",
    "./integrationCustomActions": "./src/components/TokenButton.tsx",
    "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
    "./activityLog": "./src/components/ActivityLogs.tsx",
  },

  routes: {
    url: "http://localhost:3119/remoteEntry.js",
    scope: "calls",
    module: "./routes",
  },

  layout: {
    url: "http://localhost:3119/remoteEntry.js",
    scope: "calls",
    module: "./call",
  },
  menus: [
    {
      text: 'Call Center',
      url: '/calls/switchboard',
      icon: 'icon-phone-call',
      location: 'mainNavigation',
      permission: 'showCallDashboard'
    }],
  inboxIntegrationForm: "./inboxIntegrationForm",
  invoiceDetailRightSection: "./invoiceDetailRightSection",
  integrationDetailsForm: "./integrationDetailsForm",
  integrationCustomActions: "./integrationCustomActions",
  inboxIntegrationSettings: "./inboxIntegrationSettings",
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
  activityLog: "./activityLog",
};
