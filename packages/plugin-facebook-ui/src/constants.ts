export const INTEGRATIONS = [
  {
    name: 'Facebook Post',
    description: 'Connect to Facebook posts right from your Team Inbox',
    inMessenger: false,
    isAvailable: true,
    kind: 'facebook-post',
    logo: '/images/integrations/facebook.png',
    createModal: 'facebook-post',
    createUrl: '/settings/integrations/createFacebook',
    category:
      'All integrations, For support teams, Marketing automation, Social media'
  },
  {
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
      'All integrations, For support teams, Messaging, Social media, Conversation'
  }
];

export const KINDS = {
  MESSENGER: 'facebook-messenger',
  POST: 'facebook-post',
  ALL: ['facebook-messenger', 'facebook-post']
};
