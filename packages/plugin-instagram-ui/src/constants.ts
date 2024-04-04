export const INTEGRATIONS = [
  {
    name: 'Instagram Messenger',
    description:
      'Connect and manage Instagram Messages right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'instagram-messenger',
    logo: '/images/integrations/instagram.png',
    createModal: 'instagram-messenger',
    createUrl: '/settings/integrations/createInstagram',
    category:
      'All integrations, For support teams, Messaging, Social media, Conversation'
  }
];

export const KINDS = {
  MESSENGER: 'instagram-messenger',
  ALL: ['instagram-messenger']
};
