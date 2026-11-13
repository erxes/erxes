import { db, organizations, pluginInstallations, plugins, withSystem } from '@erxes/core-db';
import { and, eq, sql } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { cookieMember } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { signJwt } from '~/lib/signing';
import { subdomainFromHost } from '~/modules/auth/auth.service';
import { pluginSession } from './installations.service';

/** `/pl:<plugin>/…`: the browser's way to a plugin's API, on core's own address. */
const PLUGIN_PATH = /^\/pl:([a-z][a-z0-9_]{0,39})(?=\/|\?|$)/;

/** The organisation of the address, signed for one plugin (`verifyPluginOrg` in the SDK). */
const ORG_HEADER = 'x-erxes-org';
const ORG_TOKEN_TYP = 'erxes-plugin-org+jwt';
const ORG_TOKEN_TTL_SECONDS = 5 * 60;

interface Upstream {
  target: string;
  headers: Record<string, string>;
}

const upstreams = new WeakMap<Request, Upstream>();

/** An active plugin's API address, from its manifest. */
const apiUrlOf = async (name: string) => {
  const [row] = await db()
    .select({ manifest: plugins.manifest })
    .from(plugins)
    .where(and(eq(plugins.name, name), eq(plugins.status, 'active')))
    .limit(1);

  return row?.manifest?.api?.url ?? null;
};

/**
 * The organisation a visitor's address belongs to, among those that installed
 * the plugin: the subdomain's (or DEFAULT_SUBDOMAIN's), else the only one.
 */
const orgOfAddress = async (host: string | undefined, name: string) => {
  const subdomain = subdomainFromHost(host);

  const rows = await withSystem('plugin proxy: the address organisation', (tx) =>
    tx
      .select({ id: organizations.id })
      .from(organizations)
      .innerJoin(
        pluginInstallations,
        and(
          eq(pluginInstallations.orgId, organizations.id),
          eq(pluginInstallations.plugin, name),
          eq(pluginInstallations.status, 'active'),
        ),
      )
      .where(
        subdomain ? eq(sql`lower(${organizations.subdomain})`, subdomain.toLowerCase()) : undefined,
      )
      .limit(2),
  );

  return rows.length === 1 ? (rows[0]?.id ?? null) : null;
};

const orgToken = (orgId: string, name: string) =>
  signJwt(
    { org: orgId },
    { typ: ORG_TOKEN_TYP, audience: name, expiresInSeconds: ORG_TOKEN_TTL_SECONDS },
  );

/**
 * Who the plugin is told is calling. A signed-in member's request carries
 * their plugin session token (`Authorization`) and their organisation; a
 * visitor's (careers pages, a mobile app with its own token) keeps its
 * `Authorization` and carries the address's organisation.
 */
const identityFor = async (req: Request, name: string): Promise<Record<string, string>> => {
  const member = await cookieMember(req);

  if (member) {
    const session = await pluginSession(member.actor, name);

    return {
      authorization: `Bearer ${session.token}`,
      [ORG_HEADER]: await orgToken(member.actor.orgId, name),
    };
  }

  const orgId = await orgOfAddress(req.get('host'), name);

  return orgId ? { [ORG_HEADER]: await orgToken(orgId, name) } : {};
};

const resolveUpstream = async (req: Request, _res: Response, next: NextFunction) => {
  const name = PLUGIN_PATH.exec(req.path)?.[1];

  if (!name) return next();

  const target = await apiUrlOf(name);

  if (!target) throw new HttpError(404, 'NOT_FOUND', 'No such plugin');

  upstreams.set(req, { target, headers: await identityFor(req, name) });

  return next();
};

const forward = createProxyMiddleware<Request, Response>({
  pathFilter: (_path, req) => upstreams.has(req),
  router: (req) => upstreams.get(req)?.target ?? '',
  pathRewrite: (path) => {
    const rest = path.replace(PLUGIN_PATH, '');

    return rest.startsWith('/') ? rest : `/${rest}`;
  },
  changeOrigin: true,
  xfwd: true,
  on: {
    proxyReq: (proxyReq, req) => {
      // Core's cookie never leaves core, and only core names the organisation.
      proxyReq.removeHeader('cookie');
      proxyReq.removeHeader(ORG_HEADER);

      for (const [name, value] of Object.entries(upstreams.get(req)?.headers ?? {})) {
        proxyReq.setHeader(name, value);
      }
    },
    // A plugin can't set cookies on core's address.
    proxyRes: (proxyRes) => {
      delete proxyRes.headers['set-cookie'];
    },
  },
});

/**
 * `/pl:<plugin>/<path>` → `<manifest api.url>/<path>`, streamed both ways.
 * Mounted before the JSON parser, so bodies pass through untouched.
 */
export const pluginProxy = [resolveUpstream, forward];
