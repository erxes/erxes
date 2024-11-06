export const INTEGRATIONS = [
  {
    name: 'whatsapp',
    description:
      'Connect and manage Whatsapp Messages right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'whatsapp',
    logo: '/images/integrations/whatsapp.png',
    createModal: 'whatsapp',
    createUrl: '/settings/integrations/createWhatsapp',
    category:
      'All integrations, For support teams, Messaging, Social media, Conversation'
  }
];
export const KINDS = {
  MESSENGER: 'whatsapp',
  POST: 'whatsapp-post',
  ALL: ['whatsapp', 'whatsapp-post']
};
