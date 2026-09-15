export const debugError = (message: string): void => {
  console.error('[viber:error]', message);
};

export const logViberWebhookFailure = (
  context: {
    subdomain: string;
    integrationId: string;
    stage: 'subscription' | 'media-settings' | 'message' | 'lifecycle';
  },
  error: unknown,
): void => {
  // Never log the exception message/stack: provider and storage errors can
  // contain credentials, signed URLs, or customer content.
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'number' &&
    Number.isSafeInteger(error.code)
      ? error.code
      : undefined;
  debugError(
    JSON.stringify({ message: 'Webhook processing failed', ...context, code }),
  );
};
