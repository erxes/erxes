import {
  ICloudflareSendAttachment,
  ICloudflareSendPayload,
} from '@/integrations/mail/@types/cloudflare';
import {
  MAIL_SEND_MAX_BYTES,
  MAIL_SEND_MAX_HEADER_BYTES,
  MAIL_SEND_MAX_RECIPIENTS,
  MAIL_SEND_MAX_SUBJECT_LENGTH,
} from '@/integrations/mail/constants';
import { readAttachmentBytes } from '@/integrations/mail/utils/attachments';
import { debugError } from '@/integrations/mail/debuggers';
import { describeError } from '@/integrations/mail/utils/errors';
import { sendEmail } from '@/integrations/mail/utils/cloudflare/api';
import {
  CloudflareError,
  describeCloudflareError,
} from '@/integrations/mail/utils/cloudflare/client';
import { ICloudflareSendingAccount } from '@/integrations/mail/utils/cloudflare/sending';
import {
  buildThreadingHeaders,
  countRecipients,
  isRetryableStatus,
  MailSendError,
  toPlainText,
} from '@/integrations/mail/utils/transports/common';
import {
  IMailTransport,
  IMailTransportOutcome,
  ISendMailInput,
} from '@/integrations/mail/utils/transports/types';

const headerBytes = (headers: Record<string, string>) =>
  Object.entries(headers).reduce(
    (total, [name, value]) =>
      total + Buffer.byteLength(`${name}: ${value}\r\n`),
    0,
  );

const fitHeaders = (headers?: Record<string, string>) => {
  if (!headers || headerBytes(headers) <= MAIL_SEND_MAX_HEADER_BYTES) {
    return headers;
  }

  const references = (headers.References ?? '').split(' ').filter(Boolean);
  const trimmed = { ...headers };

  while (
    references.length > 1 &&
    headerBytes(trimmed) > MAIL_SEND_MAX_HEADER_BYTES
  ) {
    references.splice(1, 1);
    trimmed.References = references.join(' ');
  }

  if (headerBytes(trimmed) > MAIL_SEND_MAX_HEADER_BYTES) {
    delete trimmed.References;
  }

  return Object.keys(trimmed).length ? trimmed : undefined;
};

const toCloudflareAttachments = async (
  subdomain: string,
  input: ISendMailInput,
) => {
  const stored = (input.attachments ?? []).filter(
    (attachment) => attachment.url,
  );

  if (!stored.length) {
    return undefined;
  }

  return await Promise.all(
    stored.map(async (attachment): Promise<ICloudflareSendAttachment> => {
      const filename = attachment.name || 'attachment';

      const buffer = await readAttachmentBytes(
        subdomain,
        attachment.url as string,
      ).catch((error: unknown) => {
        const reason = describeError(error);

        throw new MailSendError(
          `The attachment "${filename}" could not be read back for sending: ${reason}`,
          false,
        );
      });

      return {
        content: buffer.toString('base64'),
        filename,
        type: attachment.type || 'application/octet-stream',
        disposition: attachment.disposition ?? 'attachment',
        ...(attachment.contentId ? { content_id: attachment.contentId } : {}),
      };
    }),
  );
};

const tooLarge = (bytes: number) =>
  new MailSendError(
    `This message is ${Math.ceil(
      bytes / (1024 * 1024),
    )} MB once encoded and Cloudflare sends up to ${
      MAIL_SEND_MAX_BYTES / (1024 * 1024)
    } MB — share the large attachments as links instead`,
    false,
  );

const assertDeclaredWithinLimits = (input: ISendMailInput, text?: string) => {
  const declared = (input.attachments ?? []).reduce(
    (total, attachment) => total + Math.ceil((attachment.size ?? 0) * 1.37),
    0,
  );

  const bytes =
    Buffer.byteLength(input.html ?? '') +
    Buffer.byteLength(text ?? '') +
    declared;

  if (bytes > MAIL_SEND_MAX_BYTES) {
    throw tooLarge(bytes);
  }
};

const assertWithinLimits = (
  input: ISendMailInput,
  attachments?: ICloudflareSendAttachment[],
  text?: string,
) => {
  const recipients = countRecipients(input);

  if (recipients > MAIL_SEND_MAX_RECIPIENTS) {
    throw new MailSendError(
      `Cloudflare accepts ${MAIL_SEND_MAX_RECIPIENTS} recipients per message and this one has ${recipients} — send it in smaller batches`,
      false,
    );
  }

  const bytes =
    Buffer.byteLength(input.html ?? '') +
    Buffer.byteLength(text ?? '') +
    (attachments ?? []).reduce(
      (total, attachment) => total + attachment.content.length,
      0,
    );

  if (bytes > MAIL_SEND_MAX_BYTES) {
    throw tooLarge(bytes);
  }
};

const toSendFailure = (error: unknown) => {
  if (error instanceof MailSendError) {
    return error;
  }

  if (error instanceof CloudflareError) {
    return new MailSendError(
      describeCloudflareError(error),
      isRetryableStatus(error.status),
    );
  }

  return new MailSendError(describeError(error), true);
};

export const createCloudflareTransport = (
  subdomain: string,
  account: ICloudflareSendingAccount,
): IMailTransport => ({
  name: 'Cloudflare',
  provider: 'custom',
  domain: account.domain,

  async send(input: ISendMailInput): Promise<IMailTransportOutcome> {
    const text = toPlainText(input.html);

    assertDeclaredWithinLimits(input, text);

    const attachments = await toCloudflareAttachments(subdomain, input);

    assertWithinLimits(input, attachments, text);

    const payload: ICloudflareSendPayload = {
      to: input.to,
      cc: input.cc?.length ? input.cc : undefined,
      bcc: input.bcc?.length ? input.bcc : undefined,
      from: input.fromName
        ? { address: input.from, name: input.fromName }
        : { address: input.from },
      reply_to: input.replyTo || undefined,
      subject: (input.subject ?? '').slice(0, MAIL_SEND_MAX_SUBJECT_LENGTH),
      html: input.html || undefined,
      text: text || undefined,
      attachments,
      headers: fitHeaders(
        buildThreadingHeaders(input, { includeMessageId: false }),
      ),
    };

    try {
      const result = await sendEmail(
        account.apiToken,
        account.accountId,
        payload,
      );

      // The id Cloudflare assigns is the only one that reaches a recipient, so
      // losing it silently costs header threading on every later reply.
      if (!result?.message_id) {
        debugError(
          `Cloudflare accepted ${input.messageId} without returning a message_id — replies to it can only be threaded by reply tag or subject`,
        );
      }

      return {
        providerMessageId: result?.message_id || undefined,
        delivered: result?.delivered ?? [],
        bounced: result?.permanent_bounces ?? [],
        queued: result?.queued ?? [],
      };
    } catch (e) {
      throw toSendFailure(e);
    }
  },
});
