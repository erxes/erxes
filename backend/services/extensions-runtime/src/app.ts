import { randomUUID } from 'node:crypto';
import { zValidator } from '@hono/zod-validator';
import {
  canGroup,
  extensionTenant,
  type PermissionUser,
} from 'erxes-api-shared/core-modules';
import { getSubdomain, redis } from 'erxes-api-shared/utils';
import {
  Hono,
  type Context,
  type ErrorHandler,
  type MiddlewareHandler,
} from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { getCookie } from 'hono/cookie';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { generateModels } from './connectionResolver';
import { ApiError, invalidInput } from './errors';
import { HostDbRequest, parseDbOp, runDbOp } from './hostDb';
import {
  activateVersion,
  InstallBody,
  installBuild,
  listInstalled,
  listRuns,
  RunsQuery,
  setStatus,
  uninstall,
} from './installs';
import { LIMITS } from './limits';
import { actionName } from './permissions';
import { findGrant, HOST_TOKEN, invoke } from './sandbox';

// Registered in service discovery, so the gateway proxies /pl:extensions/* here
// after its user middleware has checked the session.
export const SERVICE_NAME = 'extensions';
// Where browsers reach this service: the gateway's proxy path for it.
const PUBLIC_URL =
  process.env.EXT_PUBLIC_URL || `http://localhost:4000/pl:${SERVICE_NAME}`;

type Caller = { user: PermissionUser; tenant: string };
type Env = { Variables: { caller: Caller } };

// The tenant the request is for. getSubdomain reads nginx-hostname, then the
// gateway-set hostname header, then the Host.
const tenantOf = (c: Context) =>
  extensionTenant(
    getSubdomain({
      headers: c.req.header(),
      hostname: new URL(c.req.url).hostname,
    }),
  );

const unauthenticated = () =>
  new ApiError(401, 'UNAUTHENTICATED', 'Login required');

// Only a plain user session for now. App tokens and OAuth access tokens carry
// scopes that extensions don't check yet, so they are refused outright.
const sessionOnly = () =>
  new ApiError(
    403,
    'SESSION_REQUIRED',
    'Extensions accept only a signed-in user session, not app or OAuth tokens',
  );

const MACHINE_HEADERS = ['erxes-app-token', 'erxes-core-token', 'x-app-token'];

// The session token the browser sent, as the gateway reads it: a bearer
// header, else the auth-token cookie.
const sessionToken = (c: Context) => {
  const authorization = c.req.header('authorization');

  if (authorization) {
    return /^Bearer\s+(\S+)$/i.exec(authorization)?.[1];
  }

  return getCookie(c, 'auth-token');
};

// Verifies the session itself, the way the gateway's userMiddleware does:
// the JWT signature, the login token still stored in Redis, and an active
// user in the tenant. Headers like `userid` are never trusted.
const signedIn: MiddlewareHandler<Env> = async (c, next) => {
  if (MACHINE_HEADERS.some((name) => c.req.header(name))) {
    throw sessionOnly();
  }

  const token = sessionToken(c);

  if (!token) {
    throw unauthenticated();
  }

  let decoded: jwt.JwtPayload | string;

  try {
    decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET || 'SECRET');
  } catch {
    throw unauthenticated();
  }

  if (typeof decoded === 'string') {
    throw unauthenticated();
  }

  if (decoded.typ) {
    throw sessionOnly();
  }

  const userId: unknown = decoded.user?._id;

  if (typeof userId !== 'string') {
    throw unauthenticated();
  }

  if (!(await redis.get(`user_token_${userId}_${token}`))) {
    throw unauthenticated();
  }

  const tenant = tenantOf(c);
  const models = await generateModels(tenant);
  const user = await models.Extensions.db
    .collection<PermissionUser & { isActive?: boolean }>('users')
    .findOne(
      { _id: userId, isActive: { $ne: false } },
      {
        projection: {
          isOwner: 1,
          permissionGroupIds: 1,
          customPermissions: 1,
        },
      },
    );

  if (!user) {
    throw unauthenticated();
  }

  c.set('caller', { user, tenant });
  await next();
};

const owner: MiddlewareHandler<Env> = async (c, next) => {
  if (!c.get('caller').user.isOwner) {
    throw new ApiError(403, 'FORBIDDEN', 'Only the owner manages extensions');
  }

  await next();
};

// Only the workerd supervisor knows this token.
const hostOnly: MiddlewareHandler = async (c, next) => {
  if (c.req.header('x-ext-runtime-token') !== HOST_TOKEN) {
    throw new ApiError(401, 'UNAUTHENTICATED', 'unauthorized');
  }

  await next();
};

// zod validation with the same error envelope as every other failure.
const validate = <S extends z.ZodType>(target: 'json' | 'query', schema: S) =>
  zValidator(target, schema, (result) => {
    if (!result.success) {
      throw invalidInput(result.error);
    }
  });

const maxBody = (maxSize: number) =>
  bodyLimit({
    maxSize,
    onError: () => {
      throw new ApiError(
        413,
        'BODY_TOO_LARGE',
        `The request body is over ${maxSize} bytes`,
      );
    },
  });

// HTTP status for a failed call, by error code. Codes the extension made up
// are its own failures: 422.
const STATUS_BY_CODE = new Map<string, ApiError['status']>([
  ['INVALID_INPUT', 400],
  ['RESULT_TOO_LARGE', 413],
  ['SANDBOX_RESTARTED', 503],
  ['TIMEOUT', 504],
]);

const onError: ErrorHandler = (e, c) => {
  if (e instanceof ApiError) {
    return c.json({ ok: false, error: e.body() }, e.status);
  }

  const correlationId = randomUUID();
  console.error(`[${correlationId}] ${c.req.method} ${c.req.path}`, e);
  return c.json(
    {
      ok: false,
      error: { code: 'INTERNAL', message: `Internal error (${correlationId})` },
    },
    500,
  );
};

export const app = new Hono<Env>()
  // ---- Called by the browser through the gateway, as the signed-in user.

  .post('/call/:extId/:fn', maxBody(LIMITS.inputBytes), signedIn, async (c) => {
    const { tenant, user } = c.get('caller');
    const { extId, fn } = c.req.param();
    const models = await generateModels(tenant);
    const ext = await models.Extensions.findById(`${tenant}:${extId}`).lean();

    if (!ext || !ext.functions.includes(fn)) {
      throw new ApiError(404, 'UNKNOWN_FUNCTION', 'No such extension function');
    }

    if (ext.status !== 'installed') {
      throw new ApiError(403, 'EXTENSION_DISABLED', `${extId} is disabled`);
    }

    // Deny by default: a function the install didn't record a permission for
    // runs for nobody.
    const permission = ext.functionPermissions?.[fn];
    const allowed =
      permission === 'public' ||
      (!!permission &&
        (await canGroup(tenant, actionName(extId, permission), user)));

    if (!allowed) {
      throw new ApiError(403, 'FORBIDDEN', 'Permission required');
    }

    // An empty body is an empty input, not an error.
    const input: unknown = await c.req.json().catch(() => ({}));
    const result = await invoke({
      tenant,
      extId,
      version: ext.version,
      code: ext.code,
      codeHash: ext.codeHash,
      collections: ext.collections,
      name: fn,
      input,
      user: { _id: user._id },
    });

    await models.ExtensionRuns.create({
      subdomain: tenant,
      extId,
      version: ext.version,
      fn,
      userId: user._id,
      status: result.ok
        ? 'ok'
        : result.error.code === 'TIMEOUT'
        ? 'timeout'
        : 'error',
      ...(!result.ok && {
        error: { code: result.error.code, message: result.error.message },
      }),
      ms: result.ms,
    });

    if (!result.ok) {
      const { code, message, issues } = result.error;
      throw new ApiError(
        STATUS_BY_CODE.get(code) ?? 422,
        code,
        message,
        issues,
      );
    }

    return c.json({ ok: true as const, data: result.data });
  })

  // ---- Boot: core-api lists these remotes next to the plugin remotes.

  .get('/remotes', async (c) => {
    const tenant = tenantOf(c);
    const models = await generateModels(tenant);
    const exts = await models.Extensions.find({
      subdomain: tenant,
      status: 'installed',
      uiRemote: { $exists: true },
    }).lean();

    return c.json(
      exts.map((ext) => ({
        name: ext.uiRemote,
        entry: `${PUBLIC_URL}/ui/${ext.extId}/${ext.version}/remoteEntry.js`,
      })),
    );
  })

  .get('/ui/:extId/:version/*', async (c) => {
    const tenant = tenantOf(c);
    const { extId, version } = c.req.param();
    const path = c.req.path.slice(`/ui/${extId}/${version}/`.length);
    const models = await generateModels(tenant);
    // Not lean: a lean doc holds a BSON Binary, not a Buffer.
    const asset = await models.ExtensionAssets.findById(
      `${tenant}:${extId}@${version}/${path}`,
    );

    if (!asset) {
      return c.notFound();
    }

    return c.body(new Uint8Array(asset.content), 200, {
      'content-type': asset.contentType,
      // Versions are immutable, so a built file never changes under its URL.
      'cache-control': 'public, max-age=31536000, immutable',
    });
  })

  // ---- Install and lifecycle, owner only.

  .get('/installed', signedIn, owner, async (c) => {
    const { tenant } = c.get('caller');
    const models = await generateModels(tenant);
    return c.json({
      ok: true as const,
      data: await listInstalled(models, tenant),
    });
  })

  .get(
    '/runs/:extId',
    signedIn,
    owner,
    validate('query', RunsQuery),
    async (c) => {
      const { tenant } = c.get('caller');
      const models = await generateModels(tenant);
      const runs = await listRuns(
        models,
        tenant,
        c.req.param('extId'),
        c.req.valid('query'),
      );
      return c.json({ ok: true as const, data: runs });
    },
  )

  .post(
    '/install',
    maxBody(LIMITS.installBytes),
    signedIn,
    owner,
    validate('json', InstallBody),
    async (c) => {
      const { tenant, user } = c.get('caller');
      const models = await generateModels(tenant);
      return c.json({
        ok: true as const,
        data: await installBuild(models, tenant, user._id, c.req.valid('json')),
      });
    },
  )

  .post(
    '/rollback/:extId',
    signedIn,
    owner,
    validate('json', z.object({ version: z.string() })),
    async (c) => {
      const { tenant } = c.get('caller');
      const { extId } = c.req.param();
      const { version } = c.req.valid('json');
      const models = await generateModels(tenant);
      const previous = await activateVersion(models, tenant, extId, version);
      return c.json({
        ok: true as const,
        data: { id: extId, version, previous },
      });
    },
  )

  // Disabled extensions keep their data and builds, but run nothing, and their
  // UI and permissions disappear until enabled again.
  .post('/disable/:extId', signedIn, owner, async (c) => {
    const { tenant } = c.get('caller');
    const { extId } = c.req.param();
    await setStatus(await generateModels(tenant), tenant, extId, 'disabled');
    return c.json({
      ok: true as const,
      data: { id: extId, status: 'disabled' },
    });
  })

  .post('/enable/:extId', signedIn, owner, async (c) => {
    const { tenant } = c.get('caller');
    const { extId } = c.req.param();
    await setStatus(await generateModels(tenant), tenant, extId, 'installed');
    return c.json({
      ok: true as const,
      data: { id: extId, status: 'installed' },
    });
  })

  .post(
    '/uninstall/:extId',
    signedIn,
    owner,
    validate('json', z.object({ purge: z.boolean().default(false) })),
    async (c) => {
      const { tenant } = c.get('caller');
      const { extId } = c.req.param();
      const { purge } = c.req.valid('json');
      const models = await generateModels(tenant);
      return c.json({
        ok: true as const,
        data: await uninstall(models, tenant, extId, purge),
      });
    },
  )

  .onError(onError);

// Called by the supervisor's Host entrypoint for a running extension. Served
// on its own loopback port, never through the gateway.
export const hostApp = new Hono()
  .use(hostOnly)
  .post(
    '/db',
    maxBody(LIMITS.hostDbRequestBytes),
    validate('json', HostDbRequest),
    async (c) => {
      const request = c.req.valid('json');
      const grant = findGrant(request.grant);

      // Revoked when the call ended: a straggler from a timed-out run.
      if (!grant) {
        throw new ApiError(403, 'GRANT_EXPIRED', 'This call has already ended');
      }

      if (!grant.collections.includes(request.collection)) {
        throw new ApiError(
          404,
          'UNKNOWN_COLLECTION',
          `${grant.extId} has no collection ${request.collection}`,
        );
      }

      const call = parseDbOp(request);
      const models = await generateModels(grant.tenant);
      // A duplicate key or a bad value is the extension's mistake: hand it the
      // driver's message.
      const data = await runDbOp(
        models.Extensions.db,
        grant.extId,
        request.collection,
        call,
      ).catch((e: unknown) => {
        throw new ApiError(
          400,
          'DB_ERROR',
          e instanceof Error ? e.message : String(e),
        );
      });

      if (
        Buffer.byteLength(JSON.stringify(data) ?? '') > LIMITS.dbResultBytes
      ) {
        throw new ApiError(
          413,
          'RESULT_TOO_LARGE',
          `The result is over ${LIMITS.dbResultBytes} bytes. Lower the limit or narrow the filter.`,
        );
      }

      return c.json({ ok: true as const, data });
    },
  )
  .onError(onError);
