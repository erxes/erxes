import { z } from 'zod';
import { CustomFieldsPatch, Id, listOf } from './common';
import {
  addressWith,
  PhoneMethod,
  Code,
  CodeSent,
  customerBase as base,
  CustomerLogin,
  CustomerProfile,
  CustomerProfileFields,
  CustomerSession,
} from './customerAuthShapes';

/** The signed-in customer (`Authorization: Bearer` with a customer access token). */
export const customerAccountContract = {
  me: base
    .route({
      method: 'GET',
      path: '/customer/me',
      summary: 'Get my customer profile',
      description: "The signed-in customer's profile",
    })
    .output(CustomerProfile),
  update: base
    .route({
      method: 'PATCH',
      path: '/customer/me',
      summary: 'Change my customer profile',
      description:
        'Change name, picture, birth date or the fields customers fill in (`null` clears one). 400 INVALID_FIELD',
    })
    .input(CustomerProfileFields.extend({ customFields: CustomFieldsPatch.optional() }))
    .output(CustomerProfile),
  logins: base
    .route({
      method: 'GET',
      path: '/customer/me/logins',
      summary: 'List my sign-in addresses',
      description: 'Addresses and Google, Apple or Facebook accounts I sign in with',
    })
    .output(listOf(CustomerLogin)),
  addLogin: base
    .route({
      method: 'POST',
      path: '/customer/me/logins',
      successStatus: 202,
      summary: 'Add a sign-in address',
      description:
        'Send a code to a new address to sign in to this portal with (or, with `reply`, have the customer text it); the same answer when the address is taken. 400 SIGN_IN_UNAVAILABLE, 429 TOO_MANY_CODES',
    })
    .input(addressWith({ method: PhoneMethod.optional() }))
    .output(CodeSent),
  confirmLogin: base
    .route({
      method: 'POST',
      path: '/customer/me/logins/confirm',
      successStatus: 201,
      summary: 'Confirm a sign-in address',
      description:
        'Add the address with its code. 400 INVALID_CODE, 409 TAKEN, 409 CODE_PENDING (not texted yet)',
    })
    .input(addressWith({ code: Code }))
    .output(CustomerLogin),
  removeLogin: base
    .route({
      method: 'DELETE',
      path: '/customer/me/logins/{id}',
      summary: 'Remove a sign-in address',
      description: 'Stop signing in with an address or account. 409 LAST_LOGIN',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  sessions: base
    .route({
      method: 'GET',
      path: '/customer/me/sessions',
      summary: 'List my sessions',
      description: 'Where I am signed in',
    })
    .output(listOf(CustomerSession)),
  revokeSession: base
    .route({
      method: 'DELETE',
      path: '/customer/me/sessions/{id}',
      summary: 'Sign out a device',
      description: 'Sign out one device or browser',
    })
    .input(z.object({ id: Id }))
    .output(z.object({ ok: z.literal(true) })),
  signOutEverywhere: base
    .route({
      method: 'POST',
      path: '/customer/me/sign-out-everywhere',
      summary: 'Sign out everywhere',
      description: 'Sign out of this portal everywhere (access tokens end within 15 minutes)',
    })
    .output(z.object({ ok: z.literal(true) })),
};
