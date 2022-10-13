module.exports = {
  name: "imap",
  scope: 'imap',
  port: 3014,
  exposes: {
    './routes': './src/routes.tsx',
    "./inboxIntegrationSettings": "./src/components/IntegrationSettings.tsx",
    "./inboxIntegrationForm": "./src/components/IntegrationForm.tsx",
    "./inboxConversationDetail": "./src/components/ConversationDetail.tsx",
  },
  routes: {
    url: 'http://localhost:3014/remoteEntry.js',
    scope: 'imap',
    module: './routes'
  },
  inboxIntegrationSettings: './inboxIntegrationSettings',
  inboxIntegrationForm: './inboxIntegrationForm',
  inboxConversationDetail: './inboxConversationDetail',
  inboxIntegration: {
    name: 'IMAP',
    description:
      'Connect a company email address such as sales@mycompany.com or info@mycompany.com',
    inMessenger: false,
    isAvailable: true,
    kind: 'imap',
    logo: '/images/integrations/email.png',
    createModal: 'imap',
    createUrl: '/settings/integrations/imap',
    category:
      'All integrations, For support teams, Marketing automation, Email marketing'
  }
};