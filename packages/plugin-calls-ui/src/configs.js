module.exports = {
  name: 'calls',
  port: 3017,
  scope: 'calls',
  exposes: {
    './routes': './src/routes.tsx',
    './call': './src/containers/Widget.tsx',
    './incomin-call': './src/containers/IncomingCall.tsx',
    './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
    './integrationEditForm': './src/components/IntegrationEditForm.tsx',
    './integrationCustomActions': './src/components/TokenButton.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'calls',
    module: './routes',
  },
  menus: [
    {
      text: 'Calls',
      url: '/calls',
      icon: 'icon-outgoing-call',
      location: 'topNavigation',
      scope: 'calls',
      component: './call',
    },
    {
      text: 'Incoming calls',
      icon: 'icon-outgoing-call',
      location: 'topNavigation',
      scope: 'calls',
      component: './incomin-call',
    },
  ],

  inboxIntegrationForm: './inboxIntegrationForm',
  invoiceDetailRightSection: './invoiceDetailRightSection',
  integrationEditForm: './integrationEditForm',
  integrationCustomActions: './integrationCustomActions',
  inboxIntegrations: [
    {
      name: 'Grand stream',
      description: 'Configure Grand stream device',
      isAvailable: true,
      kind: 'calls',
      logo: '/images/integrations/grandstream.png',
      createModal: 'grandstream',
    },
  ],
};
