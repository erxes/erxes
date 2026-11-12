import { SaasWorkspace } from '@erxes/core-contract';
import { withOrg } from '@erxes/core-db';
import express, { Router, type Request, type Response } from 'express';
import { config } from '~/config';
import { signAccessToken } from '~/http/auth';
import { SESSION_COOKIE, sessionCookieOptions } from '~/http/cookies';
import { HttpError } from '~/http/errors';
import { log } from '~/lib/log';
import { sessionVersionOf } from '~/modules/auth/account.service';
import { applyWorkspace, platformAuthorized, redeemHandoff, refreshEntitlements, workspaceUsage } from './saas.service';

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

const send = (res: Response, error: unknown) => {
  if (error instanceof HttpError) {
    res.status(error.status).json({ code: error.code, message: error.message, data: error.data });
    return;
  }

  log.error('saas request failed', { error });
  res.status(500).json({ code: 'INTERNAL', message: 'Try again' });
};

const fromPlatform = (req: Request, res: Response) => {
  if (platformAuthorized(req.header('authorization'))) return true;

  res.status(401).json({ code: 'UNAUTHORIZED', message: 'erxes.io platform token required' });

  return false;
};

saasRouter.use((_req, res, next) => {
  if (!config.saas.enabled) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Not a SaaS deployment' });
    return;
  }

  next();
});

saasRouter.put('/organizations/:id', express.json({ limit: '64kb' }), (req: Request, res: Response) => {
  if (!fromPlatform(req, res)) return;

  const parsed = SaasWorkspace.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'Not a valid workspace', data: { issues: parsed.error.issues } });
    return;
  }

  applyWorkspace(req.params.id ?? '', parsed.data)
    .then((result) => res.status(result.created ? 201 : 200).json(result))
    .catch((error: unknown) => send(res, error));
});

saasRouter.post('/organizations/:id/refresh', (req: Request, res: Response) => {
  if (!fromPlatform(req, res)) return;

  refreshEntitlements(req.params.id ?? '')
    .then((row) => (row ? res.json({ organizationStatus: row.orgStatus, plugins: row.plugins, lapsed: row.lapsed }) : send(res, new HttpError(404, 'NOT_FOUND', 'No such workspace'))))
    .catch((error: unknown) => send(res, error));
});

saasRouter.get('/organizations/:id', (req: Request, res: Response) => {
  if (!fromPlatform(req, res)) return;

  workspaceUsage(req.params.id ?? '')
    .then((usage) => res.json(usage))
    .catch((error: unknown) => send(res, error));
});

/** Signs the member in from erxes.io's link, then opens the workspace. A refused link goes back to erxes.io. */
export const saasLogin = (req: Request, res: Response) => {
  if (!config.saas.enabled) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Not a SaaS deployment' });
    return;
  }

  redeemHandoff(String(req.query.token ?? ''), req.get('x-forwarded-host') ?? req.get('host'))
    .then(async ({ orgId, userId }) => {
      const version = await withOrg(orgId, () => sessionVersionOf(orgId, userId));

      res.cookie(SESSION_COOKIE, signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60, version), sessionCookieOptions(req));
      res.redirect(302, '/');
    })
    .catch((error: unknown) => {
      log.warn('erxes.io sign-in hand-off refused', { error: (error as Error).message });
      res.redirect(302, `${config.saas.platformUrl}/?signin=failed`);
    });
};

saasRouter.get('/login', saasLogin);
