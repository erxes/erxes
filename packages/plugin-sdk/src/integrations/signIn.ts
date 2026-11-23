import { createRemoteJWKSet, customFetch, type JWTPayload, jwtVerify } from 'jose';
import { sha256 } from './crypto';
import type { ClientOptions } from './types';

/** Who a Google, Apple or Facebook token is for, as the service vouches. */
export interface SocialIdentity {
  /** The service's id for the person: stable, unlike their email. */
  subject: string;
  email: string | null;
  /** The service checked the email belongs to them. */
  emailVerified: boolean;
  firstName: string | null;
  lastName: string | null;
}

/** Thrown when the service doesn't vouch for a token, or it is for another app. */
export class SocialTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SocialTokenError';
  }
}

/**
 * Signs a portal's customers in with a service's account (decision 42): the portal's screen
 * gets a token from the service's own SDK, and core asks the integration who it is for.
 */
export interface SocialSignIn<C> {
  provider: 'google' | 'apple' | 'facebook';
  /** The id the portal's web button starts the service's SDK with (client id, Services ID, App ID). */
  publicId(client: C): string;
  /**
   * Who the token is for. `audiences` adds the portal's own apps (iOS bundle ids) to the
   * connection's. Throws `SocialTokenError` when the service doesn't vouch for it.
   */
  identify(
    client: C,
    input: { token: string; nonce?: string; audiences: string[] },
  ): Promise<SocialIdentity>;
}

const jwksByUrl = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

/**
 * Checks an OpenID Connect ID token (Google's, Apple's, Facebook Limited Login's) against the
 * service's published keys: signed by it, from one of `issuers`, for one of `audiences`,
 * unexpired, and with `nonce` when the app gave one (raw, or its SHA-256 as Apple's apps send).
 * Throws `SocialTokenError` otherwise.
 */
export const verifyIdToken = async (
  token: string,
  check: {
    service: string;
    jwksUrl: string;
    issuers: string[];
    audiences: string[];
    nonce?: string;
  },
  options: ClientOptions = {},
): Promise<JWTPayload> => {
  if (!check.audiences.length) {
    throw new SocialTokenError(`No ${check.service} app ids to check the token for`);
  }

  const key = `${check.jwksUrl}${options.fetch ? ':custom' : ''}`;
  let jwks = jwksByUrl.get(key);

  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(check.jwksUrl), {
      ...(options.fetch && { [customFetch]: options.fetch }),
    });
    jwksByUrl.set(key, jwks);
  }

  const payload = await jwtVerify(token, jwks, {
    issuer: check.issuers,
    audience: check.audiences,
    clockTolerance: 60,
  }).then(
    (verified) => verified.payload,
    () => {
      throw new SocialTokenError(
        `${check.service} didn't vouch for this token, or it is for another app`,
      );
    },
  );

  const { nonce } = check;

  if (nonce && payload.nonce !== nonce && payload.nonce !== sha256(nonce)) {
    throw new SocialTokenError(`The ${check.service} token is for another sign-in (nonce)`);
  }

  return payload;
};

/** A claim the service sends as a boolean or as `"true"` (Apple). */
export const isTrue = (value: unknown) => value === true || value === 'true';

/** A phone-reply session: the customer texts `text` to `to` from their phone. */
export interface PhoneReplySession {
  sessionId: string;
  to: string;
  smsUri: string;
  instruction: string;
  expiresAt: Date;
}

/**
 * Proves a customer's phone by a text they send (verify.mn): cheaper than texting them a code,
 * and the customer pays for the text.
 */
export interface PhoneReply<C> {
  start(client: C, input: { phone: string; text: string }): Promise<PhoneReplySession>;
  /** Where the session stands: the phone sent the text, not yet, or too late. */
  check(client: C, sessionId: string): Promise<'pending' | 'verified' | 'expired'>;
}
