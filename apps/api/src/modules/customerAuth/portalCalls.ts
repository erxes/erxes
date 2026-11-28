import { PORTAL_TOKEN_KINDS } from '@erxes/core-db/enums';
import { z } from 'zod';
import { fail } from '~/http/errors';
import { verifyJwt } from '~/lib/signing';
import { livePortal, type LivePortal, originNotAllowed, unknownPortal } from './customerPortals';

/** A portal token core gave for one of the portal's keys (`portal-auth/token`). */
const PortalClaims = z.object({
  sub: z.string().min(1),
  org: z.string().min(1),
  kid: z.string().min(1),
  knd: z.enum(PORTAL_TOKEN_KINDS).optional(),
  ori: z.string().optional(),
});

const portalTokenRequired = () =>
  fail(
    'UNAUTHORIZED',
    "Send X-Portal-Token: a token for one of the portal's keys, from POST /core/v1/portal-auth/token",
  );

/**
 * The portal token of a call to core's portal API (`/portal/*`): core issued it, and a browser
 * (it sends `Origin`) holds a publishable key's token traded from that same address, as plugins
 * check with `verifyPortalRequest`. 401 UNAUTHORIZED, 403 ORIGIN_NOT_ALLOWED.
 */
export const portalClaimsOfCall = async (token: string | undefined, origin: string | undefined) => {
  const claims = token
    ? await verifyJwt(token, PortalClaims, { typ: 'portal+jwt', audience: 'erxes-portal' }).catch(
        () => null,
      )
    : null;

  if (!claims) throw portalTokenRequired();

  if (origin && (claims.knd !== 'publishable' || claims.ori !== origin.toLowerCase())) {
    throw originNotAllowed();
  }

  return claims;
};

/**
 * The portal a call to core's portal API is for (`portalClaimsOfCall`), while it signs customers
 * in. 400 UNKNOWN_PORTAL.
 */
export const portalOfCall = async (
  token: string | undefined,
  origin: string | undefined,
): Promise<LivePortal> => {
  const claims = await portalClaimsOfCall(token, origin);
  const portal = await livePortal(claims.sub);

  if (portal?.orgId !== claims.org) throw unknownPortal();

  return portal;
};
