import { pluginInstallations, plugins, websites, withSystem } from '@erxes/core-db';
import { and, arrayContains, eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { fail } from '~/http/errors';

/**
 * Websites customers sign in to (decision 42): a call names one, and the
 * organisation and the web addresses browsers may call from come with it.
 */

export const originNotAllowed = () =>
  fail('ORIGIN_NOT_ALLOWED', 'This web address may not sign customers in to the website');

export const unknownWebsite = () =>
  fail('UNKNOWN_WEBSITE', 'No website with this id signs customers in');

/** A website that signs customers in now: its plugin is active and installed in its organisation. */
const liveWebsite = async (id: string) => {
  const [row] = await withSystem('customer website', (tx) =>
    tx
      .select({
        id: websites.id,
        orgId: websites.orgId,
        name: websites.name,
        origins: websites.origins,
      })
      .from(websites)
      .innerJoin(plugins, and(eq(plugins.name, websites.plugin), eq(plugins.status, 'active')))
      .innerJoin(
        pluginInstallations,
        and(
          eq(pluginInstallations.orgId, websites.orgId),
          eq(pluginInstallations.plugin, websites.plugin),
          eq(pluginInstallations.status, 'active'),
        ),
      )
      .where(eq(websites.id, id))
      .limit(1),
  );

  return row ?? null;
};

export type LiveWebsite = NonNullable<Awaited<ReturnType<typeof liveWebsite>>>;

/** A browser call (it sends `Origin`) must come from one of the website's addresses. */
const assertOrigin = (website: LiveWebsite, origin: string | undefined) => {
  if (origin && !website.origins.includes(origin.toLowerCase())) throw originNotAllowed();
};

/** The website a sign-in call names, if it signs customers in and the caller may call for it. */
export const websiteFor = async (id: string, origin: string | undefined) => {
  const website = await liveWebsite(id);

  if (!website) throw unknownWebsite();

  assertOrigin(website, origin);

  return website;
};

/** Whether the website still signs customers in, for calls with its tokens (`/customer/*`, refresh). */
export const websiteServes = async (id: string, origin: string | undefined) => {
  const website = await liveWebsite(id);

  if (!website) return false;

  assertOrigin(website, origin);

  return true;
};

/** Whether any website runs at this origin. */
const anyWebsiteAt = async (origin: string) => {
  const rows = await withSystem('customer website origins', (tx) =>
    tx
      .select({ id: websites.id })
      .from(websites)
      .where(arrayContains(websites.origins, [origin.toLowerCase()]))
      .limit(1),
  );

  return rows.length > 0;
};

/**
 * CORS on `/customer-auth/*` and `/customer/*`: answers a browser from an
 * origin some website lists (no cookies: tokens travel in the body and
 * `Authorization`), and refuses every other origin. Which website an origin
 * may act for is checked on each call.
 */
export const customerCors = async (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');

  if (!origin) return next();

  if (!(await anyWebsiteAt(origin))) throw originNotAllowed();

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
