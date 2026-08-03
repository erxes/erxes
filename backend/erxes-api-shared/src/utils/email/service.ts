import { getEmailProvider } from './resolveProvider';
import {
  IEmailProviderConfig,
  IOutboundEmail,
  ISentEmail,
  TEmailProviderName,
} from './types';

export const EMAIL_DELIVERY_ID_KEY = 'EmailDeliveryId';

export const EMAIL_SUBDOMAIN_KEY = 'Subdomain';

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

export interface IDeliveryLogPort {
  create(input: IDeliveryLogInput): Promise<string | undefined>;
  update(id: string, patch: IDeliveryLogPatch): Promise<void>;
}

export interface ISuppressionPort {
  blocked(emails: string[], source?: string): Promise<string[]>;
}

export interface ISendOutcome extends ISentEmail {
  deliveryId?: string;
  skipped?: boolean;
  suppressed?: string[];
}

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

export const deliverEmail = async ({
  cacheKey,
  config,
  message,
  log,
  suppression,
  meta,
}: {
  cacheKey: string;
  config: IEmailProviderConfig;
  message: IOutboundEmail;
  log?: IDeliveryLogPort;
  suppression?: ISuppressionPort;
  meta?: {
    source?: string;
    sourceId?: string;
    userId?: string;
    notificationId?: string;
    subdomain?: string;
  };
}): Promise<ISendOutcome> => {
  const provider = getEmailProvider(cacheKey, config);

  let recipients = message;
  let suppressed: string[] = [];

  if (suppression) {
    suppressed = await suppression.blocked(
      [...message.to, ...(message.cc || []), ...(message.bcc || [])],
      meta?.source,
    );

    if (suppressed.length) {
      const closed = new Set(suppressed);
      const to = message.to.filter((email) => !closed.has(email));

      if (!to.length) {
        return {
          messageId: '',
          provider: provider.name,
          accepted: [],
          rejected: [],
          skipped: true,
          suppressed,
        };
      }

      recipients = {
        ...message,
        to,
        cc: (message.cc || []).filter((email) => !closed.has(email)),
        bcc: (message.bcc || []).filter((email) => !closed.has(email)),
      };
    }
  }

  let deliveryId: string | undefined;

  if (log) {
    try {
      deliveryId = await log.create({
        toEmails: recipients.to,
        ccEmails: recipients.cc,
        from: recipients.from,
        subject: recipients.subject,
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

  const tracking = {
    ...(deliveryId ? { [EMAIL_DELIVERY_ID_KEY]: deliveryId } : {}),
    ...(meta?.subdomain ? { [EMAIL_SUBDOMAIN_KEY]: meta.subdomain } : {}),
  };

  const outbound: IOutboundEmail = Object.keys(tracking).length
    ? {
        ...recipients,
        customArgs: { ...(recipients.customArgs || {}), ...tracking },
      }
    : recipients;

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

    return {
      ...result,
      deliveryId,
      suppressed: suppressed.length ? suppressed : undefined,
    };
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
