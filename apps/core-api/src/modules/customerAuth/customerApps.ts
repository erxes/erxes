import { organizations, plugins, withOrg, withSystem } from '@erxes/core-db';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { config } from '~/config';
import { HttpError, notFound } from '~/http/errors';
import { clientOf, installed } from '~/modules/oauth/oauthClients';

/**
 * Plugins' customer apps (decision 42): a plugin with `customerApp` in its
 * manifest signs customers in by calling `/customer-auth/*` itself. Browsers
 * may call it, and `/customer/*`, only from the origins the app lists.
 */

/** What a customer app's request tells core about where it comes from. */
export interface AppRequest {
  /** The organisation the address core is reached at names (`acme.erxes.io`). */
  subdomain?: string;
  /** The browser page's origin (`Origin`); none from a mobile app or a server. */
  origin?: string;
}

const SUBDOMAIN = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';

const escape = (text: string) => text.replaceAll(/[.*+?^$()|[\]\\]/g, '\\$&');

/** An origin template as a pattern; `{subdomain}` captures the organisation's. */
const patternOf = (template: string) =>
  new RegExp(`^${escape(template).replaceAll('{subdomain}', `(${SUBDOMAIN})`)}$`);

/** The organisation's subdomain an origin carries, read against the app's templates. */
const subdomainInOrigin = (origins: string[], origin: string) => {
  for (const template of origins) {
    const subdomain = patternOf(template).exec(origin)?.[1];

    if (subdomain) return subdomain;
  }

  return undefined;
};

const originNotAllowed = () =>
  new HttpError(403, 'ORIGIN_NOT_ALLOWED', 'This web address may not sign customers in to the app');

/** A browser call must come from one of the app's origins, for this organisation. */
const assertOrigin = (origins: string[], subdomain: string, origin: string | undefined) => {
  if (!origin) return;

  if (!origins.some((template) => template.replaceAll('{subdomain}', subdomain) === origin)) {
    throw originNotAllowed();
  }
};

const unknownApp = () =>
  new HttpError(400, 'UNKNOWN_APP', "This app can't sign customers in to this organisation");

/** The active plugin and its app's origins, when it has a customer app. */
const appOf = async (clientId: string) => {
  const client = await clientOf(clientId);
  const origins = client?.manifest?.customerApp?.origins;

  return client && origins ? { name: client.name, origins } : null;
};

/** The organisation with this subdomain. */
const organizationNamed = async (name: string) => {
  const [row] = await withSystem('customer sign-in organisation', (tx) =>
    tx
      .select({
        id: organizations.id,
        name: organizations.name,
        subdomain: organizations.subdomain,
      })
      .from(organizations)
      .where(sql`lower(${organizations.subdomain}) = ${name.toLowerCase()}`)
      .limit(1),
  );

  if (!row) throw notFound('Organisation');

  return row;
};

const isInstalled = (orgId: string, plugin: string) =>
  withOrg(orgId, (tx) => installed(tx, orgId, plugin));

/**
 * The app and organisation a customer signs in to. The organisation comes
 * from core's address, else the app's origin, else the one named, else
 * DEFAULT_SUBDOMAIN. The app must be installed there, and a browser must call
 * from one of its origins.
 */
export const customerAppFor = async (
  input: { clientId: string; organization?: string },
  request: AppRequest,
) => {
  const app = await appOf(input.clientId);

  if (!app) throw unknownApp();

  const name =
    request.subdomain ||
    (request.origin ? subdomainInOrigin(app.origins, request.origin) : undefined) ||
    input.organization ||
    config.auth.defaultSubdomain;

  if (!name) throw notFound('Organisation');

  const organization = await organizationNamed(name);

  if (!(await isInstalled(organization.id, app.name))) throw unknownApp();

  assertOrigin(app.origins, organization.subdomain, request.origin);

  return { clientId: app.name, organization };
};

/**
 * Whether the app still serves the organisation (active, with a customer app,
 * installed), for calls with its tokens (`/customer/*`, refresh). A browser
 * call from another origin throws ORIGIN_NOT_ALLOWED.
 */
export const appServes = async (clientId: string, orgId: string, origin: string | undefined) => {
  const app = await appOf(clientId);

  if (!app || !(await isInstalled(orgId, app.name))) return false;

  if (origin) {
    const [organization] = await withSystem('customer app organisation', (tx) =>
      tx
        .select({ subdomain: organizations.subdomain })
        .from(organizations)
        .where(eq(organizations.id, orgId))
        .limit(1),
    );

    if (!organization) return false;

    assertOrigin(app.origins, organization.subdomain, origin);
  }

  return true;
};

/** Whether any active plugin's customer app runs at this origin. */
const anyAppAt = async (origin: string) => {
  const rows = await withSystem('customer app origins', (tx) =>
    tx
      .select({ manifest: plugins.manifest })
      .from(plugins)
      .where(
        and(eq(plugins.status, 'active'), isNotNull(sql`${plugins.manifest} -> 'customerApp'`)),
      ),
  );

  return rows.some((row) =>
    (row.manifest?.customerApp?.origins ?? []).some((template) => patternOf(template).test(origin)),
  );
};

/**
 * CORS for customer apps on `/customer-auth/*` and `/customer/*`: answers a
 * browser from an origin some app lists (no cookies: tokens travel in the
 * body and `Authorization`), and refuses every other origin. Which app and
 * organisation an origin may act for is checked on each call.
 */
export const customerCors = async (req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');

  if (!origin) return next();

  if (!(await anyAppAt(origin))) throw originNotAllowed();

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
