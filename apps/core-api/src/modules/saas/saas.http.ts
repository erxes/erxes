import { SaasOrganizationUpdate } from '@erxes/core-contract';
import express, { Router, type Request, type Response } from 'express';
import { config } from '~/config';
import { sessionCookieOptions, SESSION_COOKIE } from '~/http/cookies';
import { signAccessToken } from '~/http/auth';
import { HttpError } from '~/http/errors';
import { log } from '~/lib/log';
import { sessionVersionOf } from '~/modules/auth/account.service';
import { withOrg } from '@erxes/core-db';
import { applySaasUpdate, redeemHandoff, saasUsage, verifySaasSignature } from './saas.service';

/**
 * The control plane's side door (`/core/v1/saas/*`), only with SAAS=true:
 * - `PUT /organizations/:id`: the plan, plugins and limits (signed body);
 * - `GET /organizations/:id`: usage and what core holds (signature over "");
 * - `GET /login?token=`: the dashboard's sign-in hand-off.
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

saasRouter.use((req, res, next) => {
  if (!config.saas.enabled) {
    res.status(404).json({ code: 'NOT_FOUND', message: 'Not a SaaS deployment' });
    return;
  }

  next();
});

saasRouter.put('/organizations/:id', express.text({ type: '*/*', limit: '256kb' }), (req: Request, res: Response) => {
  const body = typeof req.body === 'string' ? req.body : '';

  if (!verifySaasSignature(req.header('erxes-signature'), body)) {
    res.status(401).json({ code: 'INVALID_SIGNATURE', message: 'Signature missing, wrong or too old' });
    return;
  }

  let input: SaasOrganizationUpdate;

  try {
    input = SaasOrganizationUpdate.parse(JSON.parse(body));
  } catch (error) {
    res.status(400).json({ code: 'INVALID_INPUT', message: 'Not a valid organisation update', data: { issues: (error as { issues?: unknown }).issues ?? null } });
    return;
  }

  applySaasUpdate(req.params.id ?? '', input)
    .then((result) => res.status(result.created ? 201 : 200).json(result))
    .catch((error: unknown) => send(res, error));
});

saasRouter.get('/organizations/:id', (req: Request, res: Response) => {
  if (!verifySaasSignature(req.header('erxes-signature'), '')) {
    res.status(401).json({ code: 'INVALID_SIGNATURE', message: 'Signature missing, wrong or too old' });
    return;
  }

  saasUsage(req.params.id ?? '')
    .then((usage) => res.json(usage))
    .catch((error: unknown) => send(res, error));
});

saasRouter.get('/login', (req: Request, res: Response) => {
  redeemHandoff(String(req.query.token ?? ''))
    .then(async ({ orgId, userId }) => {
      const version = await withOrg(orgId, () => sessionVersionOf(orgId, userId));

      res.cookie(SESSION_COOKIE, signAccessToken(userId, orgId, config.auth.sessionHours * 60 * 60, version), sessionCookieOptions(req));
      res.redirect(302, '/');
    })
    .catch((error: unknown) => {
      log.warn('saas sign-in hand-off refused', { error: (error as Error).message });
      res.redirect(302, `${config.saas.dashboardUrl}?signin=failed`);
    });
});
