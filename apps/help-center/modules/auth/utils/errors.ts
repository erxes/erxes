import { graphqlErrorMessage } from '@/modules/apollo/utils/result';

export const authErrorMessage = (caught: unknown): string => {
  const raw = graphqlErrorMessage(caught);

  if (/invalid login/i.test(raw)) {
    return 'That email or password is incorrect.';
  }

  if (/not verified|verify your account/i.test(raw)) {
    return 'Your account is not confirmed. Check your email to confirm it.';
  }

  if (/locked/i.test(raw)) {
    return 'Your account is temporarily locked. Please try again later.';
  }

  if (/duplicated|already exist|duplicate/i.test(raw)) {
    return 'An account with that email already exists.';
  }

  if (/at least one number/i.test(raw)) {
    return 'The password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';
  }

  return raw || 'Something went wrong. Please try again.';
};
