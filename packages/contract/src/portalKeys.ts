import { PORTAL_KEY_KINDS } from '@erxes/core-db/enums';
import { portalKeys } from '@erxes/core-db/schema';
import { oc } from '@orpc/contract';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Id, isoDate } from './common';
import { COMMON_ERRORS, ERRORS } from './errors';

// A portal's customer keys (Settings › API keys › Customer keys) and the token they trade for.

/**
 * A customer key's kind: `secret` for the portal's own server (shown once), `publishable` for
 * its web and mobile apps (ships inside them, shown any time; browsers only from the portal's
 * web addresses). Both reach the same routes; plugins limit a publishable key's calls per visitor.
 */
export const PortalKeyKind = z.enum(PORTAL_KEY_KINDS);

export type PortalKeyKind = z.infer<typeof PortalKeyKind>;

/** A portal's customer key, without its secret. */
export const PortalKey = createSelectSchema(portalKeys, {
  id: Id,
  kind: PortalKeyKind,
  createdAt: isoDate,
  lastUsedAt: isoDate,
}).pick({
  id: true,
  portalId: true,
  name: true,
  kind: true,
  /** A publishable key whole; null for a secret key. */
  key: true,
  /** The secret's last 4 characters. */
  hint: true,
  createdBy: true,
  createdAt: true,
  lastUsedAt: true,
});

export type PortalKey = z.infer<typeof PortalKey>;

const { INVALID_TOKEN, ORIGIN_NOT_ALLOWED } = ERRORS;

/** A portal's server or app trades its customer key for a token every attached plugin checks. */
export const portalAuthContract = {
  token: oc
    .errors({ ...COMMON_ERRORS, INVALID_TOKEN, ORIGIN_NOT_ALLOWED })
    .route({
      method: 'POST',
      path: '/portal-auth/token',
      summary: 'Get a portal token',
      description:
        "Trade a portal's customer key for a 15-minute token (`typ: portal+jwt`) to send to its plugins as `X-Portal-Token`. A secret key works from a server only (a call with `Origin` is refused); a publishable key works from the portal's web addresses, its mobile apps and servers. 401 INVALID_TOKEN, 403 ORIGIN_NOT_ALLOWED",
    })
    .input(z.object({ key: z.string().min(1).max(200) }))
    .output(
      z.object({
        accessToken: z.string(),
        expiresIn: z.int(),
        portalId: z.string(),
      }),
    ),
};
