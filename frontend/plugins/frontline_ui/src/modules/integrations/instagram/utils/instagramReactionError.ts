import {
  INSTAGRAM_ERROR_PATTERNS,
  resolveInstagramErrorFeedback,
  type InstagramErrorRule,
} from '@/integrations/instagram/utils/instagramErrorFeedback';

const REACTION_ERROR_RULES: InstagramErrorRule[] = [
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.windowClosed,
    key: 'instagram-reaction-window-closed',
    description:
      'Instagram no longer allows reactions to this message. Try reacting to a newer message from the customer.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.reconnect,
    key: 'instagram-reaction-reconnect',
    description:
      'Your Instagram connection has expired. Reconnect the account in Settings → Integrations, then try again.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.accessDenied,
    key: 'instagram-reaction-access-denied',
    description:
      'You do not have permission to react here. Ask an administrator to check your conversation access and Instagram connection.',
  },
  {
    pattern:
      /not supported|does not support|only allows reactions|message not found/i,
    key: 'instagram-reaction-unavailable',
    description:
      'This message is unavailable for reactions. Try another message received from the customer.',
  },
  {
    pattern: /timeout|timed out|network|failed to fetch/i,
    key: 'instagram-reaction-connection-error',
    description:
      'Could not confirm the reaction. Check your connection and refresh the conversation before trying again.',
  },
  {
    pattern: INSTAGRAM_ERROR_PATTERNS.rateLimit,
    key: 'instagram-reaction-rate-limit',
    description:
      'Instagram is limiting requests. Wait a moment before trying again.',
  },
];

export const getInstagramReactionError = (error: unknown) =>
  resolveInstagramErrorFeedback(error, REACTION_ERROR_RULES, {
    key: 'instagram-reaction-failed',
    description:
      'Could not update the Instagram reaction. Try again shortly. If this continues, check the connection in Settings → Integrations.',
  });
