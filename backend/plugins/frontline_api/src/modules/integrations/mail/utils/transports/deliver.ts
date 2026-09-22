import { addressDomain } from '@/integrations/mail/utils/address';
import { describeError } from '@/integrations/mail/utils/errors';
import {
  createDeliveryLogPort,
  createSuppressionPort,
  MAIL_DELIVERY_SOURCE,
} from '@/integrations/mail/utils/emailPorts';
import { MailSendError } from '@/integrations/mail/utils/transports/common';
import {
  IMailTransport,
  ISendMailInput,
  ISendMailResult,
} from '@/integrations/mail/utils/transports/types';

const withoutSuppressed = async (
  subdomain: string,
  input: ISendMailInput,
): Promise<{ input: ISendMailInput; suppressed: string[] }> => {
  const suppressed = await createSuppressionPort(subdomain).blocked(
    [...input.to, ...(input.cc ?? []), ...(input.bcc ?? [])],
    MAIL_DELIVERY_SOURCE,
  );

  if (!suppressed.length) {
    return { input, suppressed };
  }

  const closed = new Set(suppressed);
  const keep = (emails?: string[]) =>
    (emails ?? []).filter((email) => !closed.has(email));

  return {
    input: {
      ...input,
      to: keep(input.to),
      cc: keep(input.cc),
      bcc: keep(input.bcc),
    },
    suppressed,
  };
};

export const deliver = async (
  subdomain: string,
  transport: IMailTransport,
  input: ISendMailInput,
): Promise<ISendMailResult> => {
  const { messageId, from } = input;

  if (addressDomain(from) !== transport.domain) {
    throw new MailSendError(
      `This inbox answers from ${from}, but ${transport.name} sends for ${transport.domain} — it cannot sign for a domain it does not own`,
      false,
    );
  }

  if (!input.to.length) {
    throw new MailSendError('This reply has no recipient', false);
  }

  const { input: sendable, suppressed } = await withoutSuppressed(
    subdomain,
    input,
  );

  if (!sendable.to.length) {
    return {
      messageId,
      from,
      delivered: [],
      bounced: suppressed,
      queued: [],
    };
  }

  const log = createDeliveryLogPort(subdomain);

  const deliveryId = await log
    .create({
      toEmails: sendable.to,
      ccEmails: sendable.cc?.length ? sendable.cc : undefined,
      from,
      subject: sendable.subject,
      provider: transport.provider,
      source: MAIL_DELIVERY_SOURCE,
      sourceId: messageId,
    })
    .catch(() => undefined);

  const recordHandoff = async (patch: Parameters<typeof log.update>[1]) => {
    if (deliveryId) {
      await log.update(deliveryId, patch).catch(() => undefined);
    }
  };

  try {
    const outcome = await transport.send(sendable);
    const bounced = [...outcome.bounced, ...suppressed];

    await recordHandoff({
      status: 'sent',
      sentAt: new Date(),
      rejected: bounced.length ? bounced : undefined,
    });

    return {
      messageId,
      providerMessageId: outcome.providerMessageId,
      from,
      delivered: outcome.delivered,
      bounced,
      queued: outcome.queued,
    };
  } catch (e) {
    const failure =
      e instanceof MailSendError
        ? e
        : new MailSendError(describeError(e), true);

    await recordHandoff({
      status: 'failed',
      sentAt: new Date(),
      error: failure.message,
    });

    throw failure;
  }
};
