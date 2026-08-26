import {
  EmailProviderRequestError,
  getEmailProvider,
  IEmailAttachment,
  IEmailProviderConfig,
} from 'erxes-api-shared/utils';
import { TMailSendingProvider } from '@/integrations/mail/@types/sending';
import { readAttachmentBytes } from '@/integrations/mail/utils/attachments';
import { describeError } from '@/integrations/mail/utils/errors';
import {
  buildThreadingHeaders,
  isRetryableStatus,
  MailSendError,
  toPlainText,
} from '@/integrations/mail/utils/transports/common';
import {
  IMailTransport,
  IMailTransportOutcome,
  ISendMailInput,
} from '@/integrations/mail/utils/transports/types';

const toProviderAttachments = async (
  subdomain: string,
  input: ISendMailInput,
): Promise<IEmailAttachment[] | undefined> => {
  const stored = (input.attachments ?? []).filter(
    (attachment) => attachment.url,
  );

  if (!stored.length) {
    return undefined;
  }

  return await Promise.all(
    stored.map(async (attachment): Promise<IEmailAttachment> => {
      const filename = attachment.name || 'attachment';

      const buffer = await readAttachmentBytes(
        subdomain,
        attachment.url as string,
      ).catch((error: unknown) => {
        throw new MailSendError(
          `The attachment "${filename}" could not be read back for sending: ${describeError(error)}`,
          false,
        );
      });

      return {
        filename,
        content: buffer.toString('base64'),
        contentType: attachment.type,
      };
    }),
  );
};

const toSendFailure = (error: unknown) => {
  if (error instanceof MailSendError) {
    return error;
  }

  if (error instanceof EmailProviderRequestError) {
    return new MailSendError(error.message, isRetryableStatus(error.status));
  }

  const { responseCode, statusCode, retryable } = (error ?? {}) as {
    responseCode?: number;
    statusCode?: number;
    retryable?: boolean;
  };

  const message = describeError(error);

  if (typeof statusCode === 'number') {
    return new MailSendError(message, retryable ?? isRetryableStatus(statusCode));
  }

  return new MailSendError(message, !responseCode || responseCode < 500);
};

export interface IProviderTransportSource {
  subdomain: string;
  cacheKey: string;
  name: string;
  provider: TMailSendingProvider;
  domain: string;
  config: IEmailProviderConfig;
}

export const createProviderTransport = (
  account: IProviderTransportSource,
): IMailTransport => ({
  name: account.name,
  provider: account.provider,
  domain: account.domain,

  async send(input: ISendMailInput): Promise<IMailTransportOutcome> {
    const provider = getEmailProvider(account.cacheKey, account.config);

    try {
      const sent = await provider.send({
        from: input.fromName ? `${input.fromName} <${input.from}>` : input.from,
        to: input.to,
        cc: input.cc?.length ? input.cc : undefined,
        bcc: input.bcc?.length ? input.bcc : undefined,
        replyTo: input.replyTo || undefined,
        subject: input.subject ?? '',
        html: input.html ?? '',
        text: toPlainText(input.html) || undefined,
        attachments: await toProviderAttachments(account.subdomain, input),
        headers: buildThreadingHeaders(input, { includeMessageId: true }),
      });

      return {
        providerMessageId: sent.messageId || undefined,
        delivered: sent.accepted,
        bounced: sent.rejected,
        queued: [],
      };
    } catch (e) {
      throw toSendFailure(e);
    }
  },
});
