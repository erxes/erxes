module.exports = {
  srcDir: __dirname,
  name: 'calls',
  port: 3017,
  scope: 'calls',
  url: "http://localhost:3017/remoteEntry.js",
  exposes: {
    './routes': './src/routes.tsx',
    './call': './src/containers/SipProvider.tsx',
    './chadlaa': './src/containers/Chadlaa.tsx',
    './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
    './integrationDetailsForm': './src/components/IntegrationEditForm.tsx',
    './integrationCustomActions': './src/components/TokenButton.tsx'
  },

  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'calls',
    module: './routes'
  },
  innerWidget: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'calls',
    module: './call'
  },
  inboxIntegrationForm: './inboxIntegrationForm',
  invoiceDetailRightSection: './invoiceDetailRightSection',
  integrationDetailsForm: './integrationDetailsForm',
  integrationCustomActions: './integrationCustomActions',
  inboxIntegrations: [
    {
      name: 'Grand stream',
      description: 'Configure Grand stream device',
      isAvailable: true,
      kind: 'calls',
      logo: '/images/integrations/grandstream.png',
      createModal: 'grandstream'
    }
  ]
};
