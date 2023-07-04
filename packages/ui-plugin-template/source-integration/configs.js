module.exports = {
  name: '{name}',
  scope: '{name}',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/components/IntegrationSettings.tsx',
    './inboxIntegrationForm': './src/components/IntegrationForm.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: '{name}',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxIntegrationForm: './inboxIntegrationForm',
  inboxConversationDetail: './inboxConversationDetail',
  inboxIntegration: [{
    name: '{Name}',
    description:
      'Please write integration description on plugin config file',
    isAvailable: true,
    kind: '{name}',
    logo: '/images/integrations/{name}.png'
  }]
};
