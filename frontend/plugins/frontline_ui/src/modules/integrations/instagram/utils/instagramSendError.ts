import {
  INSTAGRAM_ERROR_PATTERNS,
  resolveInstagramErrorFeedback,
  type InstagramErrorRule,
} from '@/integrations/instagram/utils/instagramErrorFeedback';

const SEND_ERROR_RULES: InstagramErrorRule[] = [
  {
    pattern: /upload failed/i,
    key: 'instagram-send-upload-failed',
    description:
      'Instagram could not load this attachment. Upload it again or choose another file. Check whether your text was delivered before resending.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.windowClosed,
    key: 'instagram-send-window-closed',
    description:
      'Instagram’s messaging window has closed. You can reply again after the customer sends a new message.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.reconnect,
    key: 'instagram-send-reconnect',
    description:
      'Reconnect your Instagram account in Settings → Integrations before sending again.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.accessDenied,
    key: 'instagram-send-access-denied',
    description:
      'You cannot send to this conversation. Ask an administrator to check your access and Instagram connection.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.rateLimit,
    key: 'instagram-send-rate-limit',
    description:
      'Instagram is limiting requests. Wait a moment before sending again.',
  },
];

export const getInstagramSendError = (error: unknown) =>
  resolveInstagramErrorFeedback(error, SEND_ERROR_RULES, {
    key: 'instagram-send-failed',
    description:
      'Could not confirm delivery. Check the conversation before trying again to avoid sending the same message twice.',
  });
