/** Keeps provider details out of the toast while explaining the send failure. */
export const getInstagramSendError = (error: unknown): {
  key: string;
  description: string;
} => {
  const message = error instanceof Error ? error.message : '';

  if (/upload failed/i.test(message)) {
    return {
      key: 'instagram-send-upload-failed',
      description:
        'Instagram could not load this attachment. Upload it again or choose another file. Check whether your text was delivered before resending.',
    };
  }
  if (/outside of (?:the )?allowed window/i.test(message)) {
    return {
      key: 'instagram-send-window-closed',
      description:
        'Instagram’s messaging window has closed. You can reply again after the customer sends a new message.',
    };
  }
  if (/access token|session has expired|oauth|token.*expired/i.test(message)) {
    return {
      key: 'instagram-send-reconnect',
      description:
        'Reconnect your Instagram account in Settings → Integrations before sending again.',
    };
  }
  if (/permission|not have access|authentication required/i.test(message)) {
    return {
      key: 'instagram-send-access-denied',
      description:
        'You cannot send to this conversation. Ask an administrator to check your access and Instagram connection.',
    };
  }
  if (/rate limit|too many requests/i.test(message)) {
    return {
      key: 'instagram-send-rate-limit',
      description: 'Instagram is limiting requests. Wait a moment before sending again.',
    };
  }
  return {
    key: 'instagram-send-failed',
    description:
      'Could not confirm delivery. Check the conversation before trying again to avoid sending the same message twice.',
  };
};
