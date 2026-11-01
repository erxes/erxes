import sendgridMail from '@sendgrid/mail';
import {
  getEnv,
  getSaasOrganizationDetail,
  redis,
} from 'erxes-api-shared/utils';
import { Request } from 'express';
import { IModels } from '~/connectionResolvers';
import { checkRateLimit } from '~/modules/auth/routes/oauth/utils';
import { LoginError } from '~/modules/auth/loginError';
import { getConfig } from '~/modules/organization/settings/utils/configs';
import { applyTemplate } from '~/utils/common';

const LOGIN_WINDOW_SECS = 15 * 60;
const MAX_LOGIN_FAILURES = 10;

// Rightmost entry is the one the gateway appended; leftmost ones are client-controlled
export const getRequestIp = (req: Request) => {
  const xff = req.headers['x-forwarded-for'];

  if (xff) {
    const parts = (Array.isArray(xff) ? xff[0] : xff).split(',');
    return parts[parts.length - 1].trim();
  }

  return req.ip || 'unknown';
};

const loginFailureKey = (subdomain: string, identifier: string) =>
  `auth:login:fail:${subdomain}:${(identifier || '').toLowerCase().trim()}`;

export const assertLoginAllowed = async (
  subdomain: string,
  ip: string,
  identifier: string,
) => {
  await checkRateLimit(
    `auth:login:ip:${subdomain}:${ip}`,
    30,
    LOGIN_WINDOW_SECS,
  );

  const failures =
    Number(await redis.get(loginFailureKey(subdomain, identifier))) || 0;

  if (failures >= MAX_LOGIN_FAILURES) {
    throw new LoginError('rate_limited');
  }
};

export const recordLoginFailure = async (
  subdomain: string,
  identifier: string,
) => {
  const key = loginFailureKey(subdomain, identifier);
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, LOGIN_WINDOW_SECS);
  }
};

export const clearLoginFailures = (subdomain: string, identifier: string) =>
  redis.del(loginFailureKey(subdomain, identifier));

export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidEmail(email: string | undefined | null): boolean {
  if (!email || typeof email !== 'string') return false;

  const trimmedEmail = email.trim();

  return trimmedEmail.length > 0 && isEmail(trimmedEmail);
}

export const sendSaasMagicLinkEmail = async ({
  subdomain,
  models,
  toEmail,
  link,
}: {
  subdomain: string;
  models: IModels;
  toEmail: string;
  link: string;
}) => {
  const SENDGRID_API_KEY = getEnv({ name: 'SENDGRID_API_KEY', subdomain });
  const DOMAIN = getEnv({ name: 'DOMAIN', subdomain });

  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY is missing in environment');
  }

  const COMPANY_EMAIL_FROM = await getConfig('COMPANY_EMAIL_FROM', '', models);
  let hasCompanyFromEmail = isValidEmail(COMPANY_EMAIL_FROM);
  const organization = await getSaasOrganizationDetail({ subdomain });

  const data: any = { link, email: toEmail };

  data.domain = DOMAIN;

  if (organization.isWhiteLabel) {
    data.whiteLabel = true;
    data.organizationName = organization.name || '';
    data.organizationDomain = organization.domain || '';
  } else {
    hasCompanyFromEmail = false;
  }

  const html = await applyTemplate(data, 'magicLogin');

  const fromEmail = hasCompanyFromEmail
    ? `Noreply <${COMPANY_EMAIL_FROM}>`
    : 'noreply@erxes.io';

  sendgridMail.setApiKey(SENDGRID_API_KEY);
  return await sendgridMail
    .send({
      from: fromEmail,
      to: toEmail,
      subject: 'Login to erxes',
      html,
    })
    .catch((error) => {
      console.error(JSON.stringify(error));
      const errorMessage =
        error.response?.body || error.message || 'Failed to send email';
      throw new Error(`Failed to send magic link email: ${errorMessage}`);
    });
};

export const getCallbackRedirectUrl = (
  subdomain: string,
  callbackUrl: string,
) => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (isProduction) {
    return `https://${subdomain}.next.erxes.io/gateway/pl:core/${callbackUrl}`;
  }

  return `http://localhost:4000/${callbackUrl}`;
};
