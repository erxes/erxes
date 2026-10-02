import { IAttachment } from 'erxes-api-shared/core-types';
import {
  IMailAttachment,
  IMailAttachmentInput,
  IMailMessage,
} from '@/integrations/mail/@types/message';
import { MAIL_RETENTION_DAYS } from '@/integrations/mail/constants';

const FALLBACK_MIME_TYPE = 'application/octet-stream';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface IUnsavedAttachment {
  name: string;
  url: string | null;
  type: string;
  size: number;
  error: string;
  expiresAt: Date;
}

const isEmbedded = (attachment: IMailAttachment, body: string) =>
  Boolean(
    attachment.contentId && attachment.url && body.includes(attachment.url),
  );

export const toNoteAttachments = ({
  body,
  attachments,
}: Pick<IMailMessage, 'body' | 'attachments'>): IAttachment[] =>
  (attachments ?? []).flatMap((attachment) =>
    attachment.url && !attachment.error && !isEmbedded(attachment, body ?? '')
      ? [
          {
            name: attachment.filename,
            url: attachment.url,
            type: attachment.mimeType || attachment.type || FALLBACK_MIME_TYPE,
            size: attachment.size ?? 0,
          },
        ]
      : [],
  );

export const toMailAttachments = (
  attachments: IAttachment[] = [],
): IMailAttachmentInput[] =>
  attachments.flatMap(({ name, url, type, size }) =>
    url ? [{ name, url, type, size }] : [],
  );

export const toUnsavedAttachments = ({
  body,
  attachments,
  createdAt,
}: Pick<
  IMailMessage,
  'body' | 'attachments' | 'createdAt'
>): IUnsavedAttachment[] => {
  const expiresAt = new Date(
    new Date(createdAt).getTime() + MAIL_RETENTION_DAYS * DAY_MS,
  );

  return (attachments ?? []).flatMap((attachment) =>
    attachment.error && !isEmbedded(attachment, body ?? '')
      ? [
          {
            name: attachment.filename,
            url: attachment.url ?? null,
            type: attachment.mimeType || attachment.type || FALLBACK_MIME_TYPE,
            size: attachment.size ?? 0,
            error: attachment.error,
            expiresAt,
          },
        ]
      : [],
  );
};
