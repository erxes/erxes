import { SaasWorkspace } from '@erxes/core-contract';
import { withOrg } from '@erxes/core-db';
import express, { Router, type Request, type Response } from 'express';
import { config } from '~/config';
import { signAccessToken } from '~/http/auth';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';
import { fail, invalidInput } from '~/http/errors';
import { sessionVersionOf } from '~/modules/auth/account.service';
import { refreshEntitlements } from './entitlements';
import { redeemHandoff } from './handoff';
import { applyWorkspace, platformAuthorized, workspaceUsage } from './workspace';

/**
 * erxes.io's door into core (`/core/v1/saas/*`), only with SAAS=true. Calls
 * from erxes.io carry `Authorization: Bearer <SAAS_PLATFORM_TOKEN>`:
 * - `PUT /organizations/:id`: create, rename, enable or disable a workspace;
 * - `POST /organizations/:id/refresh`: read its plugins from erxes.io now (after a purchase);
 * - `GET /organizations/:id`: the workspace and its usage.
 * And the members' sign-in hand-off: `GET /login?token=` (also at erxes.io's
 * `/gateway/pl:core/core-login`).
 */
export const saasRouter = Router();

const notSaas = () => fail('NOT_FOUND', 'Not a SaaS deployment');

const requirePlatform = (req: Request) => {
  if (!platformAuthorized(req.header('authorization'))) {
    throw fail('UNAUTHORIZED', 'erxes.io platform token required');
  }
};

saasRouter.use((_req, _res, next) => {
  if (!config.saas.enabled) throw notSaas();

  next();
});

saasRouter.put('/organizations/:id', express.json({ limit: '64kb' }), async (req, res) => {
  requirePlatform(req);

  const parsed = SaasWorkspace.safeParse(req.body);

  if (!parsed.success) throw invalidInput(parsed.error);

  const result = await applyWorkspace(req.params.id, parsed.data);

  res.status(result.created ? 201 : 200).json(result);
});

saasRouter.post('/organizations/:id/refresh', async (req, res) => {
  requirePlatform(req);

  const row = await refreshEntitlements(req.params.id);

  if (!row) throw fail('NOT_FOUND', 'No such workspace');

  res.json({ organizationStatus: row.orgStatus, plugins: row.plugins, lapsed: row.lapsed });
});

saasRouter.get('/organizations/:id', async (req, res) => {
  requirePlatform(req);

  res.json(await workspaceUsage(req.params.id));
});

/** Signs the member in from erxes.io's link, then opens the workspace. A refused link goes back to erxes.io. */
export const saasLogin = async (req: Request, res: Response) => {
  if (!config.saas.enabled) throw notSaas();

  const handoff = await redeemHandoff(
    typeof req.query.token === 'string' ? req.query.token : '',
    req.get('x-forwarded-host') ?? req.get('host'),
  ).catch((error: unknown) => {
    req.log.warn({ err: error }, 'erxes.io sign-in hand-off refused');

    return null;
  });

  if (!handoff) {
    res.redirect(302, `${config.saas.platformUrl}/?signin=failed`);

    return;
  }

  const { orgId, userId } = handoff;
  const version = await withOrg(orgId, () => sessionVersionOf(userId));

  res.cookie(
    SESSION_COOKIE,
    await signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60, version),
    sessionCookieOptions(req),
  );
  res.redirect(302, '/');
};

saasRouter.get('/login', saasLogin);
