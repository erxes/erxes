import { randomUUID } from 'node:crypto';
import { stripHtml } from 'string-strip-html';
import { ISendMailInput } from '@/integrations/mail/utils/transports/types';

export class MailSendError extends Error {
  public readonly retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);

    this.name = 'MailSendError';
    this.retryable = retryable;
  }
}

export const isRetryableFailure = (error: unknown) =>
  error instanceof MailSendError ? error.retryable : true;

const RETRYABLE_STATUSES = new Set([408, 425, 429]);

export const isRetryableStatus = (status: number) =>
  RETRYABLE_STATUSES.has(status) || status >= 500;

export const buildMessageId = (from: string) => {
  const domain = from.split('@').pop() || 'localhost';

  return `<${randomUUID()}@${domain}>`;
};

export const toPlainText = (html: string) =>
  stripHtml(html || '').result.trim();

export const buildThreadingHeaders = (
  input: ISendMailInput,
  { includeMessageId = true }: { includeMessageId?: boolean } = {},
) => {
  const headers: Record<string, string> = {};

  if (includeMessageId && input.messageId) {
    headers['Message-ID'] = input.messageId;
  }

  if (input.inReplyTo) {
    headers['In-Reply-To'] = input.inReplyTo;
  }

  if (input.references?.length) {
    headers.References = input.references.join(' ');
  }

  return Object.keys(headers).length ? headers : undefined;
};

export const countRecipients = (input: ISendMailInput) =>
  input.to.length + (input.cc?.length ?? 0) + (input.bcc?.length ?? 0);
