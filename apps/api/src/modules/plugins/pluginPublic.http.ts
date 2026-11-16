import { newId, withOrg } from '@erxes/core-db';
import express, { type Request, type RequestHandler, Router } from 'express';
import { fail } from '~/http/errors';
import { sha256 } from '~/lib/crypto';
import { requestOutbound } from '~/lib/outbound';
import { signJwt } from '~/lib/signing';
import { activeInstallation } from './pluginDelivery';

/** The token's `typ` on a call core forwards to a plugin's `/public` route. */
const PUBLIC_CALL_TYP = 'erxes-core-public+jwt';

/** The most a public call or its answer may carry. */
const MAX_BYTES = 1024 * 1024;

/**
 * Request headers core doesn't pass on: hop-by-hop, the caller's credentials for core, encodings
 * (core reads the body inflated and passes the answer's bytes on as they come), and the client
 * addresses proxies set, which the caller could make up. Core sets `x-forwarded-for` itself.
 */
const DROPPED = new Set([
  'accept-encoding',
  'authorization',
  'cf-connecting-ip',
  'connection',
  'content-encoding',
  'content-length',
  'cookie',
  'expect',
  'fastly-client-ip',
  'forwarded',
  'host',
  'keep-alive',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'true-client-ip',
  'upgrade',
  'x-client-ip',
  'x-cluster-client-ip',
  'x-real-ip',
]);

const isDropped = (name: string) => DROPPED.has(name) || name.startsWith('x-forwarded-');

/** Answer headers passed back; any other, cookies above all, stays with the plugin. */
const KEPT = ['content-type', 'location', 'retry-after'] as const;

/** A path segment core forwards: letters, digits and `_ . ~ -`, never `.` or `..` alone. */
const SEGMENT = /^[\w.~-]+$/;

const forwardedHeaders = (req: Request) =>
  Object.fromEntries(
    Object.entries(req.headers).flatMap(([name, value]) =>
      isDropped(name) || value === undefined
        ? []
        : [[name, Array.isArray(value) ? value.join(', ') : value]],
    ),
  );

/** The path, or null when a segment could leave the path it names or carries a slash. */
const pathOf = (segments: unknown) => {
  const list = Array.isArray(segments) ? segments.map(String) : [];

  const safe = list.every(
    (segment) => SEGMENT.test(segment) && segment !== '.' && segment !== '..',
  );

  return list.length && safe ? `/${list.join('/')}` : null;
};

/** The manifest names the path, or one it is under. */
const isPublic = (paths: string[] = [], path: string) =>
  paths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const notFound = () => fail('NOT_FOUND', 'No such route');

/** The route's plugin and organisation, as decoded from the address. */
const routeOf = (req: Request) => ({
  name: typeof req.params.name === 'string' ? req.params.name : '',
  orgId: typeof req.params.orgId === 'string' ? req.params.orgId : '',
});

/** The plugin's `api.url` and the path, before the body is read; 404 unless both are public. */
const findRoute: RequestHandler = async (req, res, next) => {
  const { name, orgId } = routeOf(req);
  const path = pathOf(req.params.path);

  if (!path || orgId.length > 64) throw notFound();

  const installation = await withOrg(orgId, (tx) => activeInstallation(tx, name));
  const apiUrl = installation?.manifest?.api?.url;

  if (!apiUrl || !isPublic(installation.manifest?.publicPaths, path)) throw notFound();

  res.locals.target = `${apiUrl.replace(/\/+$/, '')}/public${path}`;
  next();
};

const forward: RequestHandler = async (req, res) => {
  const { name, orgId } = routeOf(req);
  const target = String(res.locals.target);
  const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  const id = newId();

  const token = await signJwt(
    { org: orgId, public: id, sha: sha256(body, 'base64url') },
    { typ: PUBLIC_CALL_TYP, audience: name, subject: `public:${id}`, expiresInSeconds: 60 },
  );

  const query = req.originalUrl.includes('?')
    ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
    : '';

  const answer = await requestOutbound(`${target}${query}`, {
    method: req.method,
    body,
    headers: {
      ...forwardedHeaders(req),
      authorization: `Bearer ${token}`,
      'x-forwarded-for': req.ip ?? '',
    },
    timeoutMs: 15_000,
    maxBytes: MAX_BYTES,
  }).catch((error: unknown) => {
    req.log.warn({ err: error, plugin: name }, 'public call: the plugin did not answer');

    throw fail('PLUGIN_UNREACHABLE', `${name} did not answer`);
  });

  for (const header of KEPT) {
    const value = answer.headers[header];

    if (typeof value === 'string') res.set(header, value);
  }

  // The answer comes from core's address, beside the member's session: it can't run script, be
  // sniffed into HTML, or be kept by a shared cache.
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; sandbox",
    'Cache-Control': 'no-store',
  });
  res.status(answer.status).send(answer.body);
};

/**
 * `/core/v1/plugins/:name/public/:orgId/*`: a caller outside erxes (a webhook, a redirect after
 * an app install) reaching a plugin for one organisation. Core forwards it to the plugin's
 * `<api.url>/public/<path>` when the organisation has the plugin installed and the manifest's
 * `publicPaths` name the path, with a 60-second token naming the organisation and signing the
 * body. The plugin's answer comes back with its status, type and redirect, never its cookies.
 * `limits` run first, on the decoded plugin and organisation.
 */
export const pluginPublicRouter = (limits: RequestHandler[]) =>
  Router().all(
    '/plugins/:name/public/:orgId/*path',
    ...limits,
    findRoute,
    express.raw({ type: () => true, limit: MAX_BYTES }),
    forward,
  );
