module.exports = {
  name: 'calls',
  port: 3017,
  scope: 'calls',
  exposes: {
    './routes': './src/routes.tsx',
    './call': './src/containers/SipProvider.tsx',
    './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
    './integrationDetailsForm': './src/components/IntegrationEditForm.tsx',
    './integrationCustomActions': './src/components/TokenButton.tsx'
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'calls',
    module: './routes'
  },
  menus: [
    {
      text: 'Calls',
      url: '/calls',
      icon: 'icon-outgoing-call',
      location: 'topNavigation',
      scope: 'calls',
      component: './call'
    }
  ],

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
