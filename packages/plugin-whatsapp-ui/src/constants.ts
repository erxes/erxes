export const INTEGRATIONS = [
  {
    name: 'Whatsapp Messenger',
    description:
      'Connect and manage Whatsapp Messages right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'whatsapp-messenger',
    logo: '/images/integrations/whatsapp.png',
    createModal: 'whatsapp-messenger',
    createUrl: '/settings/integrations/createWhatsapp',
    category:
      'All integrations, For support teams, Messaging, Social media, Conversation'
  }
];
export const KINDS = {
  MESSENGER: 'whatsapp-messenger',
  POST: 'whatsapp-post',
  ALL: ['whatsapp-messenger', 'whatsapp-post']
};
