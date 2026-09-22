import { alignSender, IOutboundEmail } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { resolveAlignedFrom } from '~/utils/email/senders';
import { getScopedCacheKey, getScopedEmailConfig } from '~/utils/email/scope';

interface INodemailerParams {
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string }>;
  headers?: Record<string, string>;
}

interface IOutboundOptions {
  unsubscribeUrl?: string;
  alignedFrom?: string | null;
}

export const getBroadcastEmailConfig = (models: IModels) =>
  getScopedEmailConfig(models, 'broadcast');

export const getBroadcastAlignedFrom = (models: IModels) =>
  resolveAlignedFrom(models, 'broadcast');

export const getBroadcastCacheKey = (models: IModels) =>
  getScopedCacheKey(models, 'broadcast');

const toUnsubscribeHeaders = (unsubscribeUrl?: string) =>
  unsubscribeUrl
    ? {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      }
    : undefined;

export const toOutboundEmail = (
  params: INodemailerParams,
  { unsubscribeUrl, alignedFrom }: IOutboundOptions = {},
): IOutboundEmail => {
  const { 'X-SES-CONFIGURATION-SET': _configSet, ...customArgs } =
    params.headers || {};

  const { from, replyTo } = alignSender(
    params.from,
    params.replyTo,
    alignedFrom,
  );

  return {
    from,
    to: [params.to],
    replyTo,
    subject: params.subject,
    html: params.html,
    headers: toUnsubscribeHeaders(unsubscribeUrl),
    attachments: params.attachments,
    customArgs,
  };
};
