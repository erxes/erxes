import { pluginInstallations, plugins, portalPlugins, portals, withSystem } from '@erxes/core-db';
import { and, arrayContains, eq, exists } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { fail } from '~/http/errors';

/**
 * Portals customers sign in to (decision 42): a call names one, and the
 * organisation and the web addresses browsers may call from come with it.
 */

const originNotAllowed = () =>
  fail('ORIGIN_NOT_ALLOWED', 'This web address may not sign customers in to the portal');

export const unknownPortal = () =>
  fail('UNKNOWN_PORTAL', 'No portal with this id signs customers in');

/**
 * A portal that signs customers in now, with its settings: one of its plugins is active and
 * installed in its organisation.
 */
const livePortal = async (id: string) => {
  const [row] = await withSystem('customer portal', (tx) =>
    tx
      .select()
      .from(portals)
      .where(
        and(
          eq(portals.id, id),
          exists(
            tx
              .select({ plugin: portalPlugins.plugin })
              .from(portalPlugins)
              .innerJoin(
                plugins,
                and(eq(plugins.name, portalPlugins.plugin), eq(plugins.status, 'active')),
              )
              .innerJoin(
                pluginInstallations,
                and(
                  eq(pluginInstallations.orgId, portalPlugins.orgId),
                  eq(pluginInstallations.plugin, portalPlugins.plugin),
                  eq(pluginInstallations.status, 'active'),
                ),
              )
              .where(eq(portalPlugins.portalId, portals.id)),
          ),
        ),
      )
      .limit(1),
  );

  return row ?? null;
};

export type LivePortal = NonNullable<Awaited<ReturnType<typeof livePortal>>>;

/** A browser call (it sends `Origin`) must come from one of the portal's addresses. */
const assertOrigin = (portal: LivePortal, origin: string | undefined) => {
  if (origin && !portal.origins.includes(origin.toLowerCase())) throw originNotAllowed();
};

/** The portal a sign-in call names, if it signs customers in and the caller may call for it. */
export const portalFor = async (id: string, origin: string | undefined) => {
  const portal = await livePortal(id);

  if (!portal) throw unknownPortal();

  assertOrigin(portal, origin);

  return portal;
};

/** Whether the portal still signs customers in, for calls with its tokens (`/customer/*`, refresh). */
export const portalServes = async (id: string, origin: string | undefined) => {
  const portal = await livePortal(id);

  if (!portal) return false;

  assertOrigin(portal, origin);

  return true;
};

/** Whether any portal runs at this origin. */
const anyPortalAt = async (origin: string) => {
  const rows = await withSystem('customer portal origins', (tx) =>
    tx
      .select({ id: portals.id })
      .from(portals)
      .where(arrayContains(portals.origins, [origin.toLowerCase()]))
      .limit(1),
  );

  return rows.length > 0;
};

/**
 * CORS on `/customer-auth/*` and `/customer/*`: answers a browser from an
 * origin some portal lists (no cookies: tokens travel in the body and
 * `Authorization`), and refuses every other origin. Which portal an origin
 * may act for is checked on each call.
 */
export const customerCors = async (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');

  if (!origin) return next();

  if (!(await anyPortalAt(origin))) throw originNotAllowed();

  res.vary('Origin');
  res.set('Access-Control-Allow-Origin', origin);

  if (req.method !== 'OPTIONS') return next();

  res.set({
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-request-id',
    'Access-Control-Max-Age': '600',
  });
  res.status(204).end();
};
