/** Converts provider failures into actionable Instagram reaction feedback. */
export const getInstagramReactionError = (error: unknown) => {
  const message = error instanceof Error ? error.message : '';

  if (/outside of (?:the )?allowed window/i.test(message)) {
    return {
      key: 'instagram-reaction-window-closed',
      description:
        'Instagram no longer allows reactions to this message. Try reacting to a newer message from the customer.',
    };
  }
  if (/access token|session has expired|oauth|token.*expired/i.test(message)) {
    return {
      key: 'instagram-reaction-reconnect',
      description:
        'Your Instagram connection has expired. Reconnect the account in Settings → Integrations, then try again.',
    };
  }
  if (/permission|not have access|authentication required/i.test(message)) {
    return {
      key: 'instagram-reaction-access-denied',
      description:
        'You do not have permission to react here. Ask an administrator to check your conversation access and Instagram connection.',
    };
  }
  if (/not supported|does not support|only allows reactions|message not found/i.test(message)) {
    return {
      key: 'instagram-reaction-unavailable',
      description:
        'This message is unavailable for reactions. Try another message received from the customer.',
    };
  }
  if (/timeout|timed out|network|failed to fetch/i.test(message)) {
    return {
      key: 'instagram-reaction-connection-error',
      description:
        'Could not confirm the reaction. Check your connection and refresh the conversation before trying again.',
    };
  }
  if (/rate limit|too many requests/i.test(message)) {
    return {
      key: 'instagram-reaction-rate-limit',
      description:
        'Instagram is limiting requests. Wait a moment before trying again.',
    };
  }
  return {
    key: 'instagram-reaction-failed',
    description:
      'Could not update the Instagram reaction. Try again shortly. If this continues, check the connection in Settings → Integrations.',
  };
};
