export const parseViberWebhookBody = (rawBody: Buffer): unknown => {
  return JSON.parse(
    rawBody.toString('utf8'),
    (key: string, value: unknown, context?: { source?: string }): unknown => {
      if (key === 'message_token' && typeof value === 'number') {
        if (typeof context?.source !== 'string') {
          throw new Error('Unable to preserve Viber message token');
        }
        return context.source;
      }

      return value;
    },
  );
};
