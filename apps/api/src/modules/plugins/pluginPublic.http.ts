import { newId, withOrg } from '@erxes/core-db';
import express, { type Request, Router } from 'express';
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
 * Request headers core doesn't pass on: hop-by-hop, the caller's credentials for core, its own,
 * and encodings (core reads the body inflated and passes the answer's bytes on as they come).
 */
const DROPPED = new Set([
  'accept-encoding',
  'authorization',
  'connection',
  'content-encoding',
  'content-length',
  'cookie',
  'expect',
  'forwarded',
  'host',
  'keep-alive',
  'proxy-authorization',
  'proxy-connection',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'x-forwarded-for',
  'x-forwarded-host',
  'x-forwarded-proto',
]);

/** Answer headers passed back; any other, cookies above all, stays with the plugin. */
const KEPT = ['content-type', 'location', 'cache-control', 'retry-after'] as const;

const forwardedHeaders = (req: Request) =>
  Object.fromEntries(
    Object.entries(req.headers).flatMap(([name, value]) =>
      DROPPED.has(name) || value === undefined
        ? []
        : [[name, Array.isArray(value) ? value.join(', ') : value]],
    ),
  );

/** The path's segments, or null when one is `.` or `..`, which would leave the path it names. */
const pathOf = (segments: unknown) => {
  const list = Array.isArray(segments) ? segments.map(String) : [];

  if (!list.length || list.some((segment) => segment === '.' || segment === '..')) return null;

  return `/${list.map(encodeURIComponent).join('/')}`;
};

/** The manifest names the path, or one it is under. */
const isPublic = (paths: string[] = [], path: string) =>
  paths.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

const notFound = () => fail('NOT_FOUND', 'No such route');

/**
 * `/core/v1/plugins/:name/public/:orgId/*`: a caller outside erxes (a webhook, a redirect after
 * an app install) reaching a plugin for one organisation. Core forwards it to the plugin's
 * `<api.url>/public/<path>` when the organisation has the plugin installed and the manifest's
 * `publicPaths` name the path, with a 60-second token naming the organisation and signing the
 * body. The plugin's answer comes back with its status, type and redirect, never its cookies.
 */
export const pluginPublicRouter = Router();

pluginPublicRouter.all(
  '/plugins/:name/public/:orgId/*path',
  express.raw({ type: () => true, limit: MAX_BYTES }),
  async (req, res) => {
    const { name, orgId } = req.params;
    const path = pathOf(req.params.path);

    if (!path || orgId.length > 64) throw notFound();

    const installation = await withOrg(orgId, (tx) => activeInstallation(tx, name));
    const apiUrl = installation?.manifest?.api?.url;

    if (!apiUrl || !isPublic(installation.manifest?.publicPaths, path)) throw notFound();

    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const id = newId();

    const token = await signJwt(
      { org: orgId, public: id, sha: sha256(body, 'base64url') },
      { typ: PUBLIC_CALL_TYP, audience: name, subject: `public:${id}`, expiresInSeconds: 60 },
    );

    const query = req.originalUrl.includes('?')
      ? req.originalUrl.slice(req.originalUrl.indexOf('?'))
      : '';

    const answer = await requestOutbound(`${apiUrl.replace(/\/+$/, '')}/public${path}${query}`, {
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

    res.status(answer.status).send(answer.body);
  },
);
