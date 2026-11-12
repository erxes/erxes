import {
  type Db,
  newId,
  oauthCodes,
  oauthRefreshTokens,
  organizations,
  pluginInstallations,
  plugins,
  roles,
  users,
  withOrg,
  withSystem,
} from '@erxes/core-db';
import { and, eq, isNull, sql } from 'drizzle-orm';
import express, { type Request, type Response, Router } from 'express';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { can, sessionClaims } from '~/http/auth';
import { log } from '~/lib/log';
import { ISSUER, signJwt, verifyJwt } from '~/lib/signing';
import { recordAudit } from '~/modules/audit/audit.service';

/**
 * "Sign in with erxes": OAuth 2.1 with OpenID Connect for plugins' own apps
 * (a plugin is the client; its manifest lists its redirect addresses).
 * Authorization code + PKCE (S256) only; access and ID tokens are ES256
 * JWTs anyone can check with the JWKS; refresh tokens rotate and a reused one
 * revokes its family.
 */
export const oauthRouter = Router();

const ACCESS_TTL = 3600;
const REFRESH_DAYS = 30;
const CODE_SECONDS = 60;
const SCOPES = new Set(['openid', 'profile', 'email', 'offline_access']);

const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
const base64url = (buffer: Buffer) => buffer.toString('base64url');

const sameHash = (stored: string, value: string) => {
  const a = Buffer.from(stored);
  const b = Buffer.from(sha256(value));

  return a.length === b.length && timingSafeEqual(a, b);
};

const oauthError = (res: Response, status: number, error: string, description: string) =>
  res.status(status).json({ error, error_description: description });

const clientOf = async (clientId: string) => {
  const [row] = await withSystem('oauth client', (tx) =>
    tx
      .select({ name: plugins.name, status: plugins.status, manifest: plugins.manifest })
      .from(plugins)
      .where(eq(plugins.name, clientId))
      .limit(1),
  );

  return row?.status === 'active' ? row : null;
};

/** The redirect address, if the client lists it (with `{subdomain}` the organisation's). */
const allowedRedirect = (templates: string[], given: string, subdomain: string | null) =>
  templates.some(
    (template) => (subdomain ? template.replaceAll('{subdomain}', subdomain) : template) === given,
  );

const withParams = (url: string, params: Record<string, string | undefined>) => {
  const target = new URL(url);

  for (const [key, value] of Object.entries(params))
    if (value !== undefined) target.searchParams.set(key, value);

  return target.toString();
};

/** The signed-in member behind the session cookie, if still valid. */
const memberOfSession = async (req: Request) => {
  const claims = sessionClaims(req);

  if (!claims) return null;

  const [row] = await withOrg(claims.orgId, (tx) =>
    tx
      .select({ user: users, subdomain: organizations.subdomain })
      .from(users)
      .innerJoin(organizations, eq(organizations.id, users.orgId))
      .where(and(eq(users.orgId, claims.orgId), eq(users.id, claims.userId)))
      .limit(1),
  );

  if (!row || row.user.status !== 'active' || row.user.sessionVersion !== claims.sessionVersion)
    return null;

  return row;
};

const installed = (tx: Db, orgId: string, clientId: string) =>
  tx
    .select({ status: pluginInstallations.status })
    .from(pluginInstallations)
    .where(and(eq(pluginInstallations.orgId, orgId), eq(pluginInstallations.plugin, clientId)))
    .limit(1)
    .then(([row]) => row?.status === 'active');

oauthRouter.get('/authorize', (req: Request, res: Response, next) => {
  const query = req.query as Record<string, string | undefined>;

  (async () => {
    const client = query.client_id ? await clientOf(query.client_id) : null;
    const templates = client?.manifest?.oauth?.redirectUris ?? [];

    // Until the redirect address is known to be the client's, errors are shown here, never sent there.
    if (!client || !templates.length) return oauthError(res, 400, 'invalid_client', 'Unknown app');

    if (!query.redirect_uri)
      return oauthError(res, 400, 'invalid_request', 'redirect_uri is required');

    const member = await memberOfSession(req);

    if (!member) {
      // Sign in first, then come back here.
      return res.redirect(302, `/?next=${encodeURIComponent(req.originalUrl)}`);
    }

    if (!allowedRedirect(templates, query.redirect_uri, member.subdomain)) {
      return oauthError(
        res,
        400,
        'invalid_request',
        'This redirect address is not registered for the app',
      );
    }

    const back = (params: Record<string, string | undefined>) =>
      res.redirect(
        302,
        withParams(query.redirect_uri!, { ...params, state: query.state, iss: ISSUER }),
      );

    if (query.response_type !== 'code') return back({ error: 'unsupported_response_type' });

    if (
      !query.code_challenge ||
      query.code_challenge_method !== 'S256' ||
      !/^[A-Za-z0-9_-]{43}$/.test(query.code_challenge)
    ) {
      return back({ error: 'invalid_request', error_description: 'PKCE with S256 is required' });
    }

    const scope = (query.scope ?? 'openid').split(' ').filter((item) => SCOPES.has(item));
    const orgId = member.user.orgId;

    return withOrg(orgId, async (tx) => {
      if (!(await installed(tx, orgId, client.name))) {
        return back({
          error: 'access_denied',
          error_description: `${client.manifest?.title ?? client.name} is not installed in your organisation`,
        });
      }

      const id = newId();
      const secret = base64url(randomBytes(32));

      await tx.insert(oauthCodes).values({
        id,
        orgId,
        clientId: client.name,
        userId: member.user.id,
        codeHash: sha256(secret),
        redirectUri: query.redirect_uri!,
        codeChallenge: query.code_challenge!,
        scope: scope.join(' ') || 'openid',
        nonce: query.nonce?.slice(0, 200) ?? null,
        expiresAt: sql`now() + make_interval(secs => ${CODE_SECONDS})`,
      });

      return back({ code: `${id}.${secret}` });
    });
  })().catch(next);
});

interface Issued {
  orgId: string;
  userId: string;
  clientId: string;
  scope: string;
  nonce?: string | null;
  familyId?: string;
}

/** Access token, ID token (openid) and a refresh token (offline_access), in the member's organisation. */
const issueTokens = async (tx: Db, issued: Issued) => {
  const [row] = await tx
    .select({
      user: users,
      organization: organizations,
      permissions: roles.permissions,
      manifest: plugins.manifest,
    })
    .from(users)
    .innerJoin(organizations, eq(organizations.id, users.orgId))
    .innerJoin(roles, and(eq(roles.orgId, users.orgId), eq(roles.key, users.role)))
    .innerJoin(plugins, eq(plugins.name, issued.clientId))
    .where(and(eq(users.orgId, issued.orgId), eq(users.id, issued.userId)))
    .limit(1);

  if (!row || row.user.status !== 'active') return null;

  const actor = { role: row.user.role, permissions: row.permissions };

  const permissions = (row.manifest?.permissions ?? [])
    .map((item) => item.action)
    .filter((action) => can(actor, action));

  const scopes = issued.scope.split(' ');

  const access_token = await signJwt(
    {
      org: issued.orgId,
      scope: issued.scope,
      client_id: issued.clientId,
      role: row.user.role,
      permissions,
    },
    {
      typ: 'at+jwt',
      audience: issued.clientId,
      subject: issued.userId,
      expiresInSeconds: ACCESS_TTL,
    },
  );

  const response: Record<string, unknown> = {
    access_token,
    token_type: 'Bearer',
    expires_in: ACCESS_TTL,
    scope: issued.scope,
  };

  if (scopes.includes('openid')) {
    response.id_token = await signJwt(
      {
        org: issued.orgId,
        organization: row.organization.subdomain,
        ...(scopes.includes('email') ? { email: row.user.email, email_verified: true } : {}),
        ...(scopes.includes('profile')
          ? {
              name: row.user.fullName ?? row.user.email,
              given_name: row.user.firstName ?? undefined,
              family_name: row.user.lastName ?? undefined,
              picture: row.user.avatarUrl ?? undefined,
            }
          : {}),
        ...(issued.nonce ? { nonce: issued.nonce } : {}),
      },
      {
        typ: 'JWT',
        audience: issued.clientId,
        subject: issued.userId,
        expiresInSeconds: ACCESS_TTL,
      },
    );
  }

  if (scopes.includes('offline_access')) {
    const id = newId();
    const secret = base64url(randomBytes(32));

    await tx.insert(oauthRefreshTokens).values({
      id,
      orgId: issued.orgId,
      clientId: issued.clientId,
      userId: issued.userId,
      familyId: issued.familyId ?? id,
      tokenHash: sha256(secret),
      scope: issued.scope,
      sessionVersion: row.user.sessionVersion,
      expiresAt: sql`now() + make_interval(days => ${REFRESH_DAYS})`,
    });
    response.refresh_token = `${id}.${secret}`;
  }

  return response;
};

const tokenRouter = Router();

tokenRouter.use(express.urlencoded({ extended: false, limit: '16kb' }));

tokenRouter.post('/token', (req: Request, res: Response, next) => {
  const body = (req.body ?? {}) as Record<string, string | undefined>;

  res.set('Cache-Control', 'no-store');
  (async () => {
    const client = body.client_id ? await clientOf(body.client_id) : null;

    if (!client) return oauthError(res, 401, 'invalid_client', 'Unknown app');

    if (body.grant_type === 'authorization_code') {
      const [id, secret] = (body.code ?? '').split('.');

      const [code] = id
        ? await withSystem('oauth code lookup', (tx) =>
            tx.select().from(oauthCodes).where(eq(oauthCodes.id, id)).limit(1),
          )
        : [];

      if (
        !code ||
        !secret ||
        !sameHash(code.codeHash, secret) ||
        code.clientId !== client.name ||
        code.redirectUri !== body.redirect_uri ||
        code.expiresAt.getTime() < Date.now()
      ) {
        return oauthError(res, 400, 'invalid_grant', 'The code is not valid');
      }

      if (
        !body.code_verifier ||
        base64url(createHash('sha256').update(body.code_verifier).digest()) !== code.codeChallenge
      ) {
        return oauthError(res, 400, 'invalid_grant', 'The PKCE verifier does not match');
      }

      const response = await withOrg(code.orgId, async (tx) => {
        const [used] = await tx
          .update(oauthCodes)
          .set({ usedAt: sql`now()` })
          .where(and(eq(oauthCodes.id, code.id), isNull(oauthCodes.usedAt)))
          .returning({ id: oauthCodes.id });

        // A code works once.
        if (!used || !(await installed(tx, code.orgId, client.name))) return null;

        const tokens = await issueTokens(tx, code);

        if (tokens) {
          await recordAudit(
            tx,
            { orgId: code.orgId, actorType: 'user', actorId: code.userId, source: 'core' },
            {
              action: 'auth.oauth_signed_in',
              targetType: 'plugin',
              targetId: client.name,
              targetLabel: client.manifest?.title ?? client.name,
            },
          );
        }

        return tokens;
      });

      return response
        ? res.json(response)
        : oauthError(res, 400, 'invalid_grant', 'The code is not valid');
    }

    if (body.grant_type === 'refresh_token') {
      const [id, secret] = (body.refresh_token ?? '').split('.');

      const [token] = id
        ? await withSystem('oauth refresh lookup', (tx) =>
            tx.select().from(oauthRefreshTokens).where(eq(oauthRefreshTokens.id, id)).limit(1),
          )
        : [];

      if (
        !token ||
        !secret ||
        !sameHash(token.tokenHash, secret) ||
        token.clientId !== client.name
      ) {
        return oauthError(res, 400, 'invalid_grant', 'The refresh token is not valid');
      }

      const response = await withOrg(token.orgId, async (tx) => {
        const [current] = await tx
          .select()
          .from(oauthRefreshTokens)
          .where(eq(oauthRefreshTokens.id, token.id))
          .for('update')
          .limit(1);

        if (!current) return null;

        // Used before (or revoked): it leaked. The whole family stops working.
        if (current.usedAt || current.revokedAt) {
          await tx
            .update(oauthRefreshTokens)
            .set({ revokedAt: sql`now()` })
            .where(
              and(
                eq(oauthRefreshTokens.familyId, current.familyId),
                isNull(oauthRefreshTokens.revokedAt),
              ),
            );
          log.warn('oauth refresh token reused: family revoked', {
            client: client.name,
            family: current.familyId,
          });

          return 'reused' as const;
        }

        const [user] = await tx
          .select({ version: users.sessionVersion, status: users.status })
          .from(users)
          .where(eq(users.id, current.userId))
          .limit(1);

        if (
          current.expiresAt.getTime() < Date.now() ||
          !user ||
          user.status !== 'active' ||
          user.version !== current.sessionVersion ||
          !(await installed(tx, current.orgId, client.name))
        ) {
          return null;
        }

        await tx
          .update(oauthRefreshTokens)
          .set({ usedAt: sql`now()` })
          .where(eq(oauthRefreshTokens.id, current.id));

        return issueTokens(tx, { ...current, familyId: current.familyId, nonce: null });
      });

      return response && response !== 'reused'
        ? res.json(response)
        : oauthError(res, 400, 'invalid_grant', 'The refresh token is not valid');
    }

    return oauthError(
      res,
      400,
      'unsupported_grant_type',
      'Use authorization_code or refresh_token',
    );
  })().catch(next);
});

/** Ends a refresh token's family (logging out of the app). Always 200, as RFC 7009 asks. */
tokenRouter.post('/revoke', (req: Request, res: Response, next) => {
  const [id, secret] = String((req.body as Record<string, unknown>)?.token ?? '').split('.');

  (async () => {
    const [token] = id
      ? await withSystem('oauth revoke lookup', (tx) =>
          tx.select().from(oauthRefreshTokens).where(eq(oauthRefreshTokens.id, id)).limit(1),
        )
      : [];

    if (token && secret && sameHash(token.tokenHash, secret)) {
      await withOrg(token.orgId, (tx) =>
        tx
          .update(oauthRefreshTokens)
          .set({ revokedAt: sql`now()` })
          .where(eq(oauthRefreshTokens.familyId, token.familyId)),
      );
    }

    res.status(200).json({});
  })().catch(next);
});

oauthRouter.use(tokenRouter);

/** OpenID Connect userinfo for an access token. */
oauthRouter.get('/userinfo', (req: Request, res: Response) => {
  const token = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : '';

  verifyJwt<{
    sub?: string;
    org?: string;
    client_id?: string;
    scope?: string;
    role?: string;
    permissions?: string[];
  }>(token, { typ: 'at+jwt' })
    .then(async ({ payload }) => {
      const [row] = await withOrg(String(payload.org), (tx) =>
        tx
          .select({ user: users, subdomain: organizations.subdomain })
          .from(users)
          .innerJoin(organizations, eq(organizations.id, users.orgId))
          .where(and(eq(users.orgId, String(payload.org)), eq(users.id, String(payload.sub))))
          .limit(1),
      );

      if (!row || row.user.status !== 'active')
        return oauthError(res, 401, 'invalid_token', 'The member is not active');

      const scopes = (payload.scope ?? '').split(' ');

      return res.json({
        sub: payload.sub,
        org: payload.org,
        organization: row.subdomain,
        role: payload.role,
        permissions: payload.permissions ?? [],
        ...(scopes.includes('email') ? { email: row.user.email, email_verified: true } : {}),
        ...(scopes.includes('profile')
          ? { name: row.user.fullName ?? row.user.email, picture: row.user.avatarUrl }
          : {}),
      });
    })
    .catch(() => oauthError(res, 401, 'invalid_token', 'The access token is not valid'));
});

/** OpenID Connect discovery (addresses relative to where core is reached). */
export const openidConfiguration = (req: Request, res: Response) => {
  const base = `${req.protocol}://${req.get('host')}/core/v1`;

  res.set('Cache-Control', 'public, max-age=300').json({
    issuer: ISSUER,
    authorization_endpoint: `${base}/oauth/authorize`,
    token_endpoint: `${base}/oauth/token`,
    userinfo_endpoint: `${base}/oauth/userinfo`,
    revocation_endpoint: `${base}/oauth/revoke`,
    jwks_uri: `${base}/.well-known/jwks.json`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: [...SCOPES],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['ES256'],
    claims_supported: [
      'sub',
      'org',
      'organization',
      'email',
      'email_verified',
      'name',
      'given_name',
      'family_name',
      'picture',
      'nonce',
    ],
  });
};
