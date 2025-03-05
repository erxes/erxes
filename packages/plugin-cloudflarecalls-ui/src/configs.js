module.exports = {
  srcDir: __dirname,
  name: "cloudflarecalls",
  port: 3116,
  scope: "cloudflarecalls",
  exposes: {
    "./routes": "./src/routes.tsx",
    "./cloudflareCall": "./src/containers/Room.tsx",
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
    "./integrationDetailsForm": "./src/components/IntegrationEditForm.tsx",
    "./inboxIntegrationSettings": "./src/containers/UpdateConfigsContainer.tsx",
  },

  routes: {
    url: "http://localhost:3116/remoteEntry.js",
    scope: "cloudflarecalls",
    module: "./routes",
  },

  layout: {
    url: "http://localhost:3116/remoteEntry.js",
    scope: "cloudflarecalls",
    module: "./cloudflareCall",
  },

  inboxIntegrationForm: "./inboxIntegrationForm",
  integrationDetailsForm: "./integrationDetailsForm",
  inboxIntegrationSettings: "./inboxIntegrationSettings",
  inboxIntegrations: [
    {
      name: "Cloudflare calls",
      description: "Configure Cloudflare Calls",
      isAvailable: true,
      kind: "cloudflarecalls",
      logo: "/images/integrations/cloudflarecall.png",
      createModal: "cloudflarecall",
    },
  ],
};
