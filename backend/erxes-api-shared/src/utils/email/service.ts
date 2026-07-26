import { getEmailProvider } from './resolveProvider';
import {
  IEmailProviderConfig,
  IOutboundEmail,
  ISentEmail,
  TEmailProviderName,
} from './types';

/**
 * Custom arg / header name the provider echoes back on delivery webhooks. The
 * existing SES SNS tracker already reads this exact header, so SES keeps
 * working untouched.
 */
export const EMAIL_DELIVERY_ID_KEY = 'EmailDeliveryId';

export interface IDeliveryLogInput {
  toEmails: string[];
  ccEmails?: string[];
  from: string;
  subject: string;
  provider: TEmailProviderName;
  source?: string;
  sourceId?: string;
  userId?: string;
  notificationId?: string;
}

export interface IDeliveryLogPatch {
  status: 'sent' | 'failed';
  sentAt: Date;
  messageId?: string;
  providerResponse?: string;
  rejected?: string[];
  error?: string;
}

/**
 * How a service persists delivery rows. core-api backs this with its own
 * models; the automations service goes through tRPC. Keeping it a port is what
 * lets the send path live in shared code without knowing about mongoose.
 */
export interface IDeliveryLogPort {
  create(input: IDeliveryLogInput): Promise<string | undefined>;
  update(id: string, patch: IDeliveryLogPatch): Promise<void>;
}

/**
 * The delivery log's provider values predate the provider layer and use their
 * own casing, so translate here rather than leaking either naming into the
 * other.
 */
export const toDeliveryLogProvider = (
  name: TEmailProviderName,
): 'sendgrid' | 'smtp' | 'ses' => {
  if (name === 'sendgrid') {
    return 'sendgrid';
  }

  if (name === 'SES') {
    return 'ses';
  }

  return 'smtp';
};

const toErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/**
 * The single way email leaves erxes. Resolves the tenant's provider, records a
 * delivery row before handing off so webhooks have something to attach to, then
 * writes back the handoff result.
 *
 * Logging is best effort: a logging failure degrades tracking, it never blocks
 * the send.
 */
export const deliverEmail = async ({
  cacheKey,
  config,
  message,
  log,
  meta,
}: {
  cacheKey: string;
  config: IEmailProviderConfig;
  message: IOutboundEmail;
  log?: IDeliveryLogPort;
  meta?: {
    source?: string;
    sourceId?: string;
    userId?: string;
    notificationId?: string;
  };
}): Promise<ISentEmail & { deliveryId?: string }> => {
  const provider = getEmailProvider(cacheKey, config);

  let deliveryId: string | undefined;

  if (log) {
    try {
      deliveryId = await log.create({
        toEmails: message.to,
        ccEmails: message.cc,
        from: message.from,
        subject: message.subject,
        provider: provider.name,
        source: meta?.source,
        sourceId: meta?.sourceId,
        userId: meta?.userId,
        notificationId: meta?.notificationId,
      });
    } catch (error) {
      console.error(
        `Failed to record email delivery: ${toErrorMessage(error)}`,
      );
    }
  }

  const outbound: IOutboundEmail = deliveryId
    ? {
        ...message,
        customArgs: {
          ...(message.customArgs || {}),
          [EMAIL_DELIVERY_ID_KEY]: deliveryId,
        },
      }
    : message;

  try {
    const result = await provider.send(outbound);

    if (log && deliveryId) {
      await log
        .update(deliveryId, {
          status: 'sent',
          sentAt: new Date(),
          messageId: result.messageId,
          rejected: result.rejected,
        })
        .catch((error) => {
          console.error(
            `Failed to update email delivery: ${toErrorMessage(error)}`,
          );
        });
    }

    return { ...result, deliveryId };
  } catch (error) {
    if (log && deliveryId) {
      await log
        .update(deliveryId, {
          status: 'failed',
          sentAt: new Date(),
          error: toErrorMessage(error),
        })
        .catch(() => undefined);
    }

    throw error;
  }
};
