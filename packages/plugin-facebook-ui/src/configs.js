module.exports = {
  name: 'facebook',
  port: 3017,
  scope: 'facebook',
  exposes: {
    './routes': './src/routes.tsx',
    './inboxIntegrationSettings': './src/containers/UpdateConfigsContainer.tsx',
  },
  routes: {
    url: 'http://localhost:3017/remoteEntry.js',
    scope: 'facebook',
    module: './routes',
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxIntegration: {
    name: 'Facebook Messenger',
    description:
      'Connect and manage Facebook Messages right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'facebook-messenger',
    logo: '/images/integrations/fb-messenger.png',
    createModal: 'facebook-messenger',
    createUrl: '/settings/integrations/createFacebook',
    category:
      'All integrations, For support teams, Messaging, Social media, Conversation',
  },
};
