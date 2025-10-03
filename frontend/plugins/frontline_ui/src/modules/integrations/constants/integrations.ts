import { IntegrationType } from '@/types/Integration';

export const INTEGRATIONS = {
  [IntegrationType.ERXES_MESSENGER]: {
    name: 'erxes Messenger',
    description:
      'Connect and manage Facebook Messages right from your Team Inbox',
    img: 'messenger.webp',
  },
  [IntegrationType.FACEBOOK_MESSENGER]: {
    name: 'Facebook Messenger',
    description:
      'Connect and manage Facebook Messages right from your Team Inbox',
    img: 'fb-messenger.svg',
  },
  [IntegrationType.FACEBOOK_POST]: {
    name: 'Facebook Post',
    description: 'Connect and manage Facebook Posts right from your Team Inbox',
    img: 'fb.svg',
  },
  [IntegrationType.CALL]: {
    name: 'Call',
    description: 'Connect and manage calls right from your Team Inbox',
    img: 'grandstream.webp',
  },
};
