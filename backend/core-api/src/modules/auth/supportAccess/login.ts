import { getEnv, getSubdomain } from 'erxes-api-shared/utils';
import { Request, Response } from 'express';
import { generateModels } from '~/connectionResolvers';
import { startSession } from '@/auth/session';
import { verifySupportToken } from '@/auth/supportAccess/token';

export type SupportLoginStatus = 'pending' | 'off' | 'invalid';

// Back to global-profile, which explains the outcome to the staff member
const resultUrl = (subdomain: string, status: SupportLoginStatus) =>
  `${getEnv({ name: 'CORE_DOMAIN' })}/support-access/result?${new URLSearchParams(
    { subdomain, status },
  )}`;

/** GET /support-login?token=: a staff member arriving from global-profile. */
export const supportLogin = async (req: Request, res: Response) => {
  const subdomain = getSubdomain(req);
  const token = typeof req.query.token === 'string' ? req.query.token : '';

  try {
    const staff = await verifySupportToken(token, subdomain);

    if (!staff) {
      return res.redirect(resultUrl(subdomain, 'invalid'));
    }

    const models = await generateModels(subdomain);
    const visit = await models.SupportGrants.enter(staff);

    if (visit.outcome !== 'entered') {
      return res.redirect(resultUrl(subdomain, visit.outcome));
    }

    await startSession({
      models,
      subdomain,
      userId: visit.userId,
      method: 'support',
      policy: visit.sessionPolicy,
      req,
      res,
    });

    return res.redirect(getEnv({ name: 'DOMAIN', subdomain }));
  } catch (e) {
    console.error(`Support login failed: ${(e as Error).message}`);

    return res.redirect(resultUrl(subdomain, 'invalid'));
  }
};
