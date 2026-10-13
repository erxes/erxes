import { graphqlErrorMessage } from '@/modules/apollo/utils/result';
import type { MessageKey, Translate } from '@/modules/i18n/translate';

const REASONS: [RegExp, MessageKey][] = [
  [/duplicated phone/i, 'tickets.error.duplicatePhone'],
  [/duplicated email/i, 'tickets.error.duplicateEmail'],
  [/no linked customer/i, 'tickets.error.noCustomer'],
  [/not authenticated|not logged in/i, 'tickets.error.sessionExpired'],
];

export const contactErrorMessage = (caught: unknown, t: Translate): string => {
  const raw = graphqlErrorMessage(caught);
  const known = REASONS.find(([pattern]) => pattern.test(raw));

  return t(known?.[1] ?? 'tickets.error.contactFallback');
};
