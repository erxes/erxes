module.exports = {
  srcDir: __dirname,
  name: 'golomtbank',
  scope: 'golomtbank',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/components/IntegrationSettings.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'golomtbank',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxConversationDetail: './inboxConversationDetail',
  inboxIntegration: {
    name: 'Golomtbank',
    description:
      'Please write integration description on plugin config file',
    isAvailable: true,
    kind: 'golomtbank',
    logo: '/images/integrations/golomtbank.png',
    createUrl: '/settings/integrations/createGolomtbank'
  }
};
