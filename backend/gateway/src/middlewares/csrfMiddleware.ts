import { getSaasOrganizationDetail } from 'erxes-api-shared/utils';
import { NextFunction, Request, Response } from 'express';
import { readSessionCookie } from '../util/session';
import { getSubdomain } from '../util/subdomain';

type AllowedOrigin = string | RegExp;

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

const matchesOrigin = (origin: string, allowed: AllowedOrigin[]) =>
  allowed.some((entry) =>
    entry instanceof RegExp ? entry.test(origin) : entry === origin,
  );

// A SaaS tenant's custom domain is cross-site by design, so it is allowed per tenant
const isTenantDomain = async (req: Request, origin: string) => {
  if (process.env.VERSION !== 'saas') {
    return false;
  }

  const organization = await getSaasOrganizationDetail({
    subdomain: getSubdomain(req),
  });

  return Boolean(
    organization?.domain &&
      organization.dnsStatus === 'active' &&
      new URL(origin).hostname === organization.domain,
  );
};

/**
 * Cookie sessions ride along on cross-site form posts when SameSite=none, and REST
 * routes accept urlencoded bodies, so unsafe requests carrying a staff cookie must
 * come from our own sites. GraphQL is also covered by the router's CSRF check.
 */
export const csrfMiddleware =
  (allowedOrigins: AllowedOrigin[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const hasStaffCookie =
      Boolean(readSessionCookie(req.cookies)) ||
      Boolean(req.cookies?.['auth-token']);

    if (SAFE_METHODS.includes(req.method) || !hasStaffCookie) {
      return next();
    }

    // Browsers set this and page scripts cannot; same-site covers app./api. splits
    const site = req.headers['sec-fetch-site'];

    if (site === 'same-origin' || site === 'same-site' || site === 'none') {
      return next();
    }

    const origin = req.headers.origin;

    // No Origin: not a browser, which cannot ride a victim's cookie
    if (!origin) {
      return next();
    }

    try {
      if (
        matchesOrigin(origin, allowedOrigins) ||
        (await isTenantDomain(req, origin))
      ) {
        return next();
      }
    } catch {
      // Unparseable origin or lookup failure: fall through to reject
    }

    return res.status(403).json({ error: 'Cross-site request blocked' });
  };
