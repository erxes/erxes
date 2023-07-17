module.exports = {
  name: 'discord',
  scope: 'discord',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/components/IntegrationSettings.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'discord',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxConversationDetail: './inboxConversationDetail',
  inboxIntegrations: [{
    name: 'Discord',
    description:
      'Please write integration description on plugin config file',
    isAvailable: true,
    kind: 'discord',
    logo: '/images/integrations/discord.png',
    createUrl: '/settings/integrations/createDiscord'
  }]
};
