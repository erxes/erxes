import { graphqlErrorMessage } from '@/modules/apollo/utils/result';

const REASONS: [RegExp, string][] = [
  [
    /duplicated phone/i,
    'This phone number is registered to another customer. Please enter a different number.',
  ],
  [/duplicated email/i, 'This email is registered to another customer.'],
  [
    /no linked customer/i,
    'Your account is not linked to a customer record. Please contact the support team.',
  ],
  [
    /not authenticated|not logged in/i,
    'Your session has expired. Please sign in and try again.',
  ],
];

const FALLBACK = 'Could not save your name and phone number to the record.';

export const contactErrorMessage = (caught: unknown): string => {
  const raw = graphqlErrorMessage(caught);
  const known = REASONS.find(([pattern]) => pattern.test(raw));

  return known?.[1] ?? FALLBACK;
};
