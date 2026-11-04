import { createHash, randomUUID } from 'node:crypto';
import { zValidator } from '@hono/zod-validator';
import {
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
import {
  gatewayUpstream,
  HostGraphqlRequest,
  runOperation,
  summarizeOperation,
} from './graphql';
import { ApiError, invalidInput } from './errors';
import { GraphqlRequest, runExtensionGraphql } from './extensionGraphql';
import {
  conflict,
  HostDbRequest,
  isDuplicateKey,
  prepareDbCall,
  resultTooLarge,
  runDbCall,
} from './hostDb';
import {
  activateVersion,
  InstallBody,
  installBuild,
  listInstalled,
  Operations,
  setStatus,
  uninstall,
} from './installs';
import { DEV_MODE, LIMITS } from './limits';
import { findGrant, HOST_TOKEN, type Session } from './sandbox';

// Registered in service discovery, so the gateway proxies /pl:extensions/* here
// after its user middleware has checked the session.
export const SERVICE_NAME = 'extensions';
// Where browsers reach this service, relative to the gateway. Every tenant's
// browser prepends its own gateway URL, so one process serves every tenant.
const GATEWAY_PATH = `/pl:${SERVICE_NAME}`;

type Caller = { user: PermissionUser; tenant: string; session: Session };
type Env = { Variables: { caller: Caller } };

// The hostname the request came in on, read as getSubdomain reads it:
// nginx-hostname, then the gateway-set hostname header, then the Host.
const hostnameOf = (c: Context) =>
  c.req.header('nginx-hostname') ||
  c.req.header('hostname') ||
  new URL(c.req.url).hostname;

// The tenant the request is for.
const tenantOf = (c: Context) =>
  extensionTenant(getSubdomain({ headers: {}, hostname: hostnameOf(c) }));

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

// core-api's login session (core-api/src/modules/auth/session.ts): an opaque
// id in this cookie, stored in Redis under its hash per subdomain.
const SESSION_COOKIE = 'erxes-sid';
const SECURE_SESSION_COOKIE = '__Host-erxes-sid';

const StoredSession = z.object({ userId: z.string(), expiresAt: z.number() });

// The gateway already slid the session's idle window on this request.
const sessionUserId = async (c: Context, sid: string) => {
  const subdomain = getSubdomain({ headers: {}, hostname: hostnameOf(c) });
  const hash = createHash('sha256').update(sid).digest('hex');
  const raw = await redis.get(`session:${subdomain}:${hash}`);
  const session = raw ? StoredSession.safeParse(JSON.parse(raw)) : undefined;

  return session?.success && session.data.expiresAt > Date.now()
    ? session.data.userId
    : undefined;
};

// A legacy login JWT: a bearer token or an auth-token cookie from before
// sessions. The signature and the login token still stored in Redis.
const jwtUserId = async (token: string) => {
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

  return userId;
};

// The caller, read in the gateway's order: a bearer token, else the session
// cookie, else the auth-token cookie.
const callerOf = async (c: Context) => {
  const bearer = /^Bearer\s+(\S+)$/i.exec(
    c.req.header('authorization') ?? '',
  )?.[1];
  const sid = bearer
    ? undefined
    : getCookie(c, SECURE_SESSION_COOKIE) || getCookie(c, SESSION_COOKIE);
  const sidUser = sid && (await sessionUserId(c, sid));

  if (sidUser) {
    return {
      userId: sidUser,
      credential: { cookie: `${SESSION_COOKIE}=${sid}` },
    };
  }

  const token = bearer || getCookie(c, 'auth-token');

  if (!token) {
    throw unauthenticated();
  }

  return {
    userId: await jwtUserId(token),
    credential: { authorization: `Bearer ${token}` },
  };
};

// Verifies the session itself, the way the gateway's userMiddleware does, and
// an active user in the tenant. Headers like `userid` are never trusted.
const signedIn: MiddlewareHandler<Env> = async (c, next) => {
  if (MACHINE_HEADERS.some((name) => c.req.header(name))) {
    throw sessionOnly();
  }

  // A cross-site form can POST with the session cookie but can't send JSON
  // without a CORS preflight, so every write must declare JSON.
  if (
    c.req.method !== 'GET' &&
    !c.req.header('content-type')?.startsWith('application/json')
  ) {
    throw new ApiError(415, 'JSON_REQUIRED', 'Send the request as JSON');
  }

  const { userId, credential } = await callerOf(c);
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

  c.set('caller', {
    user,
    tenant,
    session: { credential, hostname: hostnameOf(c) },
  });
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

const onError: ErrorHandler = (e, c) => {
  const correlationId = randomUUID();
  const error =
    e instanceof ApiError
      ? e
      : new ApiError(500, 'INTERNAL', `Internal error (${correlationId})`);

  if (!(e instanceof ApiError)) {
    console.error(`[${correlationId}] ${c.req.method} ${c.req.path}`, e);
  }

  // A GraphQL client reads errors from a 200 response; any other status
  // would hide the message behind "Response not successful".
  if (c.req.path.startsWith('/graphql/')) {
    const { code, message, issues } = error.body();
    return c.json({
      errors: [{ message, extensions: { code, ...(issues && { issues }) } }],
    });
  }

  return c.json({ ok: false, error: error.body() }, error.status);
};

export const app = new Hono<Env>()
  // ---- Called by the browser through the gateway, as the signed-in user.

  // One GraphQL request to the extension's own schema. Errors come back as
  // GraphQL errors with `extensions.code`, always with status 200.
  .post(
    '/graphql/:extId',
    maxBody(LIMITS.inputBytes),
    signedIn,
    validate('json', GraphqlRequest),
    async (c) => {
      const { tenant, user, session } = c.get('caller');
      const { extId } = c.req.param();
      const models = await generateModels(tenant);
      const ext = await models.Extensions.findById(`${tenant}:${extId}`).lean();

      if (!ext) {
        throw new ApiError(
          404,
          'UNKNOWN_EXTENSION',
          `${extId} is not installed`,
        );
      }

      if (ext.status !== 'installed') {
        throw new ApiError(403, 'EXTENSION_DISABLED', `${extId} is disabled`);
      }

      return c.json(
        await runExtensionGraphql({
          ext,
          tenant,
          user,
          session,
          request: c.req.valid('json'),
        }),
      );
    },
  )

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
        entry: `${GATEWAY_PATH}/ui/${ext.extId}/${ext.version}/remoteEntry.js`,
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
      // In dev mode a reinstall replaces them: a reload must fetch again.
      'cache-control': DEV_MODE
        ? 'no-cache'
        : 'public, max-age=31536000, immutable',
    });
  })

  // ---- Install and lifecycle, owner only.

  // A build's GraphQL operations as the install-approval dialog shows them:
  // name, read/write/destructive and root fields. Checked the way install
  // checks them, so the dialog refuses what install would.
  .post(
    '/operations',
    maxBody(LIMITS.installBytes),
    signedIn,
    owner,
    validate('json', z.object({ operations: Operations })),
    (c) =>
      c.json({
        ok: true as const,
        data: Object.entries(c.req.valid('json').operations).map(
          ([hash, document]) => summarizeOperation(hash, document),
        ),
      }),
  )

  .get('/installed', signedIn, owner, async (c) => {
    const { tenant } = c.get('caller');
    const models = await generateModels(tenant);
    return c.json({
      ok: true as const,
      data: await listInstalled(models, tenant),
    });
  })

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

      const call = prepareDbCall(request, grant.extId, grant.collections);
      const models = await generateModels(grant.tenant);
      // A duplicate key arrives as CONFLICT. Any other driver error, a bad
      // value say, is the extension's mistake: hand it the driver's message.
      const data = await runDbCall(
        models.Extensions.db,
        grant.extId,
        request.collection,
        call,
      ).catch((e: unknown) => {
        if (e instanceof ApiError) {
          throw e;
        }

        throw isDuplicateKey(e)
          ? conflict(request.collection, e.keyValue ?? {})
          : new ApiError(
              400,
              'DB_ERROR',
              e instanceof Error ? e.message : String(e),
            );
      });

      if (
        Buffer.byteLength(JSON.stringify(data) ?? '') > LIMITS.dbResultBytes
      ) {
        throw resultTooLarge();
      }

      return c.json({ ok: true as const, data });
    },
  )
  // One persisted GraphQL operation, run as the caller through the gateway.
  .post(
    '/graphql',
    maxBody(LIMITS.inputBytes),
    validate('json', HostGraphqlRequest),
    async (c) => {
      const request = c.req.valid('json');
      const grant = findGrant(request.grant);

      if (!grant) {
        throw new ApiError(403, 'GRANT_EXPIRED', 'This call has already ended');
      }

      const data = await runOperation(
        grant.operations,
        request,
        gatewayUpstream(grant),
      );

      return c.json({ ok: true as const, data });
    },
  )
  .onError(onError);
