import sendgridMail from '@sendgrid/mail';
import { IUserDocument } from 'erxes-api-shared/core-types';
import {
  getEnv,
  getSaasOrganizationDetail,
  redis,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getConfig } from '~/modules/organization/settings/utils/configs';
import { applyTemplate } from '~/utils/common';

export const saveValidatedToken = (token: string, user: IUserDocument) => {
  return redis.set(`user_token_${user._id}_${token}`, 1, 'EX', 24 * 60 * 60);
};

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
