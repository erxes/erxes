import { IOutboundEmail } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { getScopedCacheKey, getScopedEmailConfig } from '~/utils/email/scope';

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

export const getBroadcastEmailConfig = (models: IModels) =>
  getScopedEmailConfig(models, 'broadcast');

export const getBroadcastCacheKey = (models: IModels) =>
  getScopedCacheKey(models, 'broadcast');

/**
 * Lets the mail client show its own unsubscribe control beside the sender name,
 * which Gmail and Yahoo have required of bulk senders since February 2024. The
 * `One-Click` post is what allows that control to act without the recipient
 * having to open the link and find the button.
 */
const toUnsubscribeHeaders = (unsubscribeUrl?: string) =>
  unsubscribeUrl
    ? {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
    : undefined;

/**
 * Adapts the existing nodemailer params to the provider layer without touching
 * `prepareEmailParams`, which other call sites still rely on as-is.
 *
 * The tracking values move from headers into `customArgs`: SES turns those back
 * into the very same headers its SNS tracker already reads, while SendGrid
 * receives them as custom args its webhook can return. The SES configuration
 * set is dropped because the provider sets it from config itself.
 */
export const toOutboundEmail = (
  params: INodemailerParams,
  unsubscribeUrl?: string,
): IOutboundEmail => {
  const { 'X-SES-CONFIGURATION-SET': _configSet, ...customArgs } =
    params.headers || {};

  return {
    from: params.from,
    to: [params.to],
    replyTo: params.replyTo,
    subject: params.subject,
    html: params.html,
    headers: toUnsubscribeHeaders(unsubscribeUrl),
    attachments: params.attachments,
    customArgs,
  };
};
