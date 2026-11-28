import {
  type CustomerSignIn,
  type PortalCall,
  verifyCustomerToken,
  verifyPortalToken,
} from './verify';

/** Why `verifyPortalRequest` refused a call: answer with `status` and `code`. */
export class PortalRequestError extends Error {
  constructor(
    readonly status: 401 | 403,
    readonly code: 'UNAUTHORIZED' | 'ORIGIN_NOT_ALLOWED',
    message: string,
  ) {
    super(message);
    this.name = 'PortalRequestError';
  }
}

/** What a call to a plugin's portal API (`/portal/v1`) carries. */
export interface PortalRequestInput {
  /** The `X-Portal-Token` header. */
  portalToken?: string | null;
  /** The `Authorization` header: a signed-in customer's `Bearer` token. */
  authorization?: string | null;
  /** The `Origin` header: a browser sends it. */
  origin?: string | null;
  /** The caller's address, as the plugin's proxy reports it (`req.ip` in Express). */
  ip?: string | null;
  /**
   * The `X-Visitor-Ip` header: a server with a secret key may name the visitor it calls for,
   * so limits apply per visitor rather than to the whole server.
   */
  visitorIp?: string | null;
}

/** A call to a plugin's portal API, checked. */
export interface PortalRequest {
  orgId: string;
  /** Serve your record on this portal; refuse a portal you're not on. */
  portalId: string;
  /** The portal token's key; null for core's agent calling with a customer token alone. */
  key: PortalCall | null;
  /** The signed-in customer, on this portal; null for a visitor. */
  customer: CustomerSignIn | null;
  /**
   * Whom to rate-limit: `ip:<address>` for a visitor (a publishable key's caller, or the one a
   * server named), `portal:<id>` for a server that named none, `agent:<id>` for core's agent.
   */
  visitor: string;
}

const IP = /^[0-9a-f.:]{2,45}$/i;

const unauthorized = (message: string) => new PortalRequestError(401, 'UNAUTHORIZED', message);

/**
 * Checks a call to a plugin's portal API (`/portal/v1`), the one API a portal's web and mobile
 * apps and its server call:
 *
 * - `X-Portal-Token` names the portal: a token core gave for one of its portal keys. Core's
 *   agent may instead send its customer token alone.
 * - `Authorization: Bearer` (optional, required by `/me` routes): the customer signed in to the
 *   same portal.
 * - A browser (it sends `Origin`) must hold a publishable key's token traded from that same web
 *   address; a secret key's token never works from a browser.
 *
 * Serve CORS to any origin on `/portal` (no cookies; the token decides), and limit calls by
 * `visitor`. Throws `PortalRequestError`.
 *
 *   const call = await verifyPortalRequest({
 *     portalToken: req.header('x-portal-token'), authorization: req.header('authorization'),
 *     origin: req.header('origin'), ip: req.ip, visitorIp: req.header('x-visitor-ip'),
 *   }, { coreUrl });
 */
export const verifyPortalRequest = async (
  input: PortalRequestInput,
  options: { coreUrl: string },
): Promise<PortalRequest> => {
  const key = input.portalToken
    ? await verifyPortalToken(input.portalToken, options).catch(() => {
        throw unauthorized('Invalid portal token');
      })
    : null;

  const customer = input.authorization
    ? await verifyCustomerToken(input.authorization, options).catch(() => {
        throw unauthorized('Sign in again');
      })
    : null;

  return portalRequestOf(input, { key, customer });
};

/** Whom a checked call is limited as. */
const visitorOf = (
  input: PortalRequestInput,
  key: PortalCall | null,
  customer: CustomerSignIn | null,
  portalId: string,
) => {
  if (!key) return `agent:${customer?.agentId}`;

  if (key.kind === 'agent') return key.keyId;

  if (key.kind === 'publishable') return `ip:${input.ip ?? 'unknown'}`;

  const visitorIp = input.visitorIp?.trim();

  return visitorIp && IP.test(visitorIp) ? `ip:${visitorIp}` : `portal:${portalId}`;
};

/**
 * `verifyPortalRequest`'s checks on tokens already verified (null when absent): for tests that
 * stand in for core's tokens. Throws `PortalRequestError`.
 */
export const portalRequestOf = (
  input: PortalRequestInput,
  { key, customer }: { key: PortalCall | null; customer: CustomerSignIn | null },
): PortalRequest => {
  const caller = key ?? (customer?.agentId ? customer : null);

  if (!caller) throw unauthorized('Portal token required');

  if (customer && (customer.orgId !== caller.orgId || customer.portalId !== caller.portalId)) {
    throw unauthorized('Sign in again');
  }

  const origin = input.origin?.toLowerCase();

  if (origin && (key?.kind !== 'publishable' || key.origin !== origin)) {
    throw new PortalRequestError(
      403,
      'ORIGIN_NOT_ALLOWED',
      key?.kind === 'publishable'
        ? 'This web address is not the one the portal token was made for'
        : 'Browsers call with a publishable portal key only',
    );
  }

  return {
    orgId: caller.orgId,
    portalId: caller.portalId,
    key,
    customer,
    visitor: visitorOf(input, key, customer, caller.portalId),
  };
};
