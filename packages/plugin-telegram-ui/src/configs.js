module.exports = {
  name: 'telegram',
  scope: 'telegram',
  port: 3024,
  exposes: {
    './routes': './src/routes.tsx',
    './inboxConversationDetail': './src/components/ConversationDetail.tsx'
  },
  routes: {
    url: 'http://localhost:3024/remoteEntry.js',
    scope: 'telegram',
    module: './routes'
  },
  inboxConversationDetail: './inboxConversationDetail',
  inboxIntegrations: [{
    name: 'Telegram',
    description:
      'Connect telegram chats to inbox',
    isAvailable: true,
    kind: 'telegram',
    logo: '/images/integrations/telegram.png',
    createUrl: '/settings/integrations/createTelegram'
  }]
};
