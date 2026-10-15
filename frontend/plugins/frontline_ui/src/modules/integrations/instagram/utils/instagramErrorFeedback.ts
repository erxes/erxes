export type InstagramErrorFeedback = {
  key: string;
  description: string;
};

export type InstagramErrorRule = InstagramErrorFeedback & {
  pattern: RegExp;
};

export const INSTAGRAM_ERROR_PATTERNS = {
  windowClosed: /outside of (?:the )?allowed window/i,
  reconnect: /access token|session has expired|oauth|token.*expired/i,
  accessDenied: /permission|not have access|authentication required/i,
  rateLimit: /rate limit|too many requests/i,
};

export const resolveInstagramErrorFeedback = (
  error: unknown,
  rules: InstagramErrorRule[],
  fallback: InstagramErrorFeedback,
): InstagramErrorFeedback => {
  const message = error instanceof Error ? error.message : '';
  const rule = rules.find(({ pattern }) => pattern.test(message));
  return rule ? { key: rule.key, description: rule.description } : fallback;
};
