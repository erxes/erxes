import { getConfig } from '@/organization/settings/utils/configs';
import {
  IEmailProviderConfig,
  IOutboundEmail,
  loadEmailProviderConfig,
} from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';

/** What `prepareEmailParams` returns — nodemailer's own shape. */
interface INodemailerParams {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string }>;
  headers?: Record<string, string>;
}

/**
 * Campaign sending used to build AWS SES transports directly, so it could only
 * ever use SES. Routing it through the provider layer instead lets a campaign
 * go out over whichever provider the organization configured.
 *
 * `BROADCAST_AWS_SES_*` stays an override: installs that deliberately put
 * campaigns on a separate SES account keep doing so instead of silently moving
 * to the transactional one.
 */
export const getBroadcastEmailConfig = async (
  models: IModels,
): Promise<IEmailProviderConfig> => {
  const config = await loadEmailProviderConfig((code, defaultValue) =>
    getConfig(code, defaultValue, models),
  );

  const overrides: Array<[keyof IEmailProviderConfig, string]> = [
    ['AWS_SES_ACCESS_KEY_ID', 'BROADCAST_AWS_SES_ACCESS_KEY_ID'],
    ['AWS_SES_SECRET_ACCESS_KEY', 'BROADCAST_AWS_SES_SECRET_ACCESS_KEY'],
    ['AWS_REGION', 'BROADCAST_AWS_REGION'],
  ];

  for (const [target, code] of overrides) {
    const value = await getConfig(code, '', models);

    if (value) {
      config[target] = value;
    }
  }

  return config;
};

/**
 * Campaigns may run on different credentials than transactional mail, so they
 * get their own cached provider instance rather than sharing one.
 */
export const getBroadcastCacheKey = (models: IModels) =>
  `${models.Users.db.name}:broadcast`;

/**
 * Adapts the existing nodemailer params to the provider layer without touching
 * `prepareEmailParams`, which other call sites still rely on as-is.
 *
 * The tracking values move from headers into `customArgs`: SES turns those back
 * into the very same headers its SNS tracker already reads, while SendGrid
 * receives them as custom args its webhook can return. The SES configuration
 * set is dropped because the provider sets it from config itself.
 */
export const toOutboundEmail = (params: INodemailerParams): IOutboundEmail => {
  const { 'X-SES-CONFIGURATION-SET': _configSet, ...customArgs } =
    params.headers || {};

  return {
    from: params.from,
    to: [params.to],
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    attachments: params.attachments,
    customArgs,
  };
};
