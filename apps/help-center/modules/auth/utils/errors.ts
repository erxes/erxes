import { graphqlErrorMessage } from '@/modules/apollo/utils/result';
import type { MessageKey, Translate } from '@/modules/i18n/translate';

const AUTH_REASONS: [RegExp, MessageKey][] = [
  [/invalid login/i, 'auth.error.invalidLogin'],
  [/not verified|verify your account/i, 'auth.error.notVerified'],
  [/locked/i, 'auth.error.locked'],
  [/duplicated|already exist|duplicate/i, 'auth.error.duplicate'],
  [/at least one number/i, 'auth.passwordHint'],
];

const PROFILE_REASONS: [RegExp, MessageKey][] = [
  [/email already exists/i, 'profile.error.emailTaken'],
  [/phone already exists/i, 'profile.error.phoneTaken'],
  [/not authenticated/i, 'profile.error.sessionExpired'],
];

const explain = (
  caught: unknown,
  reasons: [RegExp, MessageKey][],
  fallback: MessageKey,
  t: Translate,
): string => {
  const raw = graphqlErrorMessage(caught);
  const known = reasons.find(([pattern]) => pattern.test(raw));

  return known ? t(known[1]) : raw || t(fallback);
};

export const authErrorMessage = (caught: unknown, t: Translate): string =>
  explain(caught, AUTH_REASONS, 'auth.error.generic', t);

export const profileErrorMessage = (caught: unknown, t: Translate): string =>
  explain(caught, PROFILE_REASONS, 'profile.error.generic', t);
