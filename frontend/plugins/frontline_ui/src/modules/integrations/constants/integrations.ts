import { IntegrationType } from '@/types/Integration';

export const INTEGRATIONS = {
  [IntegrationType.ERXES_MESSENGER]: {
    name: 'erxes Messenger',
    descriptionKey: 'integration-desc-erxes-messenger',
    img: 'messenger.webp',
  },
  [IntegrationType.FACEBOOK_MESSENGER]: {
    name: 'Facebook Messenger',
    descriptionKey: 'integration-desc-facebook-messenger',
    img: 'fb-messenger.svg',
  },
  [IntegrationType.FACEBOOK_POST]: {
    name: 'Facebook Post',
    descriptionKey: 'integration-desc-facebook-post',
    img: 'fb.svg',
  },
  [IntegrationType.INSTAGRAM_MESSENGER]: {
    name: 'Instagram Messenger',
    descriptionKey: 'integration-desc-instagram-messenger',
    img: 'ig.svg',
  },
  [IntegrationType.INSTAGRAM_POST]: {
    name: 'Instagram Post',
    descriptionKey: 'integration-desc-instagram-post',
    img: 'ig.svg',
  },
  [IntegrationType.CALL]: {
    name: 'Call',
    descriptionKey: 'integration-desc-call',
    img: 'grandstream.webp',
  },
  [IntegrationType.IMAP]: {
    name: 'IMAP',
    descriptionKey: 'integration-desc-imap',
    img: 'email.webp',
  },
};
