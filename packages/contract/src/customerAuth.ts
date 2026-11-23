import { CUSTOMER_SOCIAL_PROVIDERS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { listOf } from './common';
import {
  addressWith,
  PhoneMethod,
  Code,
  CodeSent,
  customerBase as base,
  CustomerField,
  CustomerTokens,
  portal,
  PortalSignIn,
  RefreshToken,
  SignedIn,
  SignUpForm,
} from './customerAuthShapes';

export {
  CodeReply,
  CustomerField,
  CustomerLogin,
  CustomerProfile,
  CustomerSession,
  CustomerTokens,
  PortalSignIn,
} from './customerAuthShapes';

/**
 * Customers sign in to a portal (decision 42): the portal's own screens call these, on the web
 * or in its apps. Public; browsers only from the portal's web addresses.
 */
export const customerAuthContract = {
  methods: base
    .route({
      method: 'GET',
      path: '/customer-auth/methods',
      summary: 'How customers sign in',
      description:
        'How the portal lets customers sign in, with the ids its Google, Apple and Facebook buttons start with. 400 UNKNOWN_PORTAL',
    })
    .input(z.object({ portal }))
    .output(PortalSignIn),
  social: base
    .route({
      method: 'POST',
      path: '/customer-auth/social',
      summary: 'Sign in with Google, Apple or Facebook',
      description:
        "Sign in with a token from the service's own SDK: Google's or Apple's ID token, Facebook's access token. The first time makes the account (by the email the service vouches for, joining an account that has it), checking the sign-up fields when it does. 400 INVALID_FIELD, 400 SIGN_IN_UNAVAILABLE, 400 UNKNOWN_PORTAL, 401 INVALID_SOCIAL_TOKEN, 403 ORIGIN_NOT_ALLOWED",
    })
    .input(
      z.object({
        portal,
        provider: z.enum(CUSTOMER_SOCIAL_PROVIDERS),
        token: z.string().min(1).max(8000),
        /** The nonce the app gave Google or Apple, when it gave one. */
        nonce: z.string().min(1).max(200).optional(),
        ...SignUpForm,
        firstName: SignUpForm.firstName.optional(),
      }),
    )
    .output(SignedIn),
  fields: base
    .route({
      method: 'GET',
      path: '/customer-auth/fields',
      summary: 'List sign-up fields',
      description:
        "The fields the portal's organisation lets customers fill in, for its sign-up and profile forms. 400 UNKNOWN_PORTAL",
    })
    .input(z.object({ portal }))
    .output(listOf(CustomerField)),
  signUp: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-up',
      successStatus: 202,
      summary: 'Sign up on a portal',
      description:
        'Make an account on the portal: checks the form and sends a code to confirm the address (or, with `reply`, has the customer text it). An address with an account gets a code too, which signs it in. 400 INVALID_FIELD, 400 UNKNOWN_PORTAL, 400 SIGN_IN_UNAVAILABLE, 403 ORIGIN_NOT_ALLOWED, 429 TOO_MANY_CODES',
    })
    .input(addressWith({ portal, method: PhoneMethod.optional(), ...SignUpForm }))
    .output(CodeSent),
  confirmSignUp: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-up/confirm',
      summary: 'Confirm a sign-up',
      description:
        'Confirm a sign-up with its code: makes the account, saves the form on the customer and signs in. 400 INVALID_CODE, 400 INVALID_FIELD, 400 UNKNOWN_PORTAL, 403 ORIGIN_NOT_ALLOWED, 409 CODE_PENDING (not texted yet)',
    })
    .input(addressWith({ portal, code: Code }))
    .output(SignedIn),
  sendCode: base
    .route({
      method: 'POST',
      path: '/customer-auth/code',
      successStatus: 202,
      summary: 'Send a sign-in code',
      description:
        'Send a code for signing in to an account on the portal. An address with no account gets no code, with the same answer: sign up first. With `reply` the customer texts the code instead, whether or not they have an account. 400 UNKNOWN_PORTAL, 400 SIGN_IN_UNAVAILABLE, 403 ORIGIN_NOT_ALLOWED, 429 TOO_MANY_CODES',
    })
    .input(addressWith({ portal, method: PhoneMethod.optional() }))
    .output(CodeSent),
  signIn: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-in',
      summary: 'Sign in with a code',
      description:
        'Sign in to an account on the portal with the code and get its tokens. 400 INVALID_CODE (wrong, used, expired or 5 tries), 400 UNKNOWN_PORTAL, 403 ORIGIN_NOT_ALLOWED, 404 NO_ACCOUNT (a texted code proved a phone with no account), 409 CODE_PENDING (not texted yet)',
    })
    .input(addressWith({ portal, code: Code }))
    .output(SignedIn),
  refresh: base
    .route({
      method: 'POST',
      path: '/customer-auth/refresh',
      summary: 'Refresh tokens',
      description:
        'New tokens for a refresh token; the old one stops working, and using it again ends the session. 401 INVALID_TOKEN, 403 ORIGIN_NOT_ALLOWED',
    })
    .input(z.object({ refreshToken: RefreshToken }))
    .output(CustomerTokens),
  signOut: base
    .route({
      method: 'POST',
      path: '/customer-auth/sign-out',
      summary: 'Sign out',
      description: "End the refresh token's session; the answer is ok either way",
    })
    .input(z.object({ refreshToken: RefreshToken }))
    .output(z.object({ ok: z.literal(true) })),
};
