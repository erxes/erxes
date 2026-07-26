import fetch from 'node-fetch';
import { IEmailAttachment } from './types';

/**
 * SendGrid's Web API accepts only inline base64 bodies, so URL-backed
 * attachments have to be downloaded first. nodemailer-based providers skip
 * this entirely and hand the URL straight through.
 */
export const toBase64Attachment = async (
  attachment: IEmailAttachment,
): Promise<{ filename: string; content: string; type?: string }> => {
  if (attachment.content) {
    return {
      filename: attachment.filename,
      content: attachment.content,
      type: attachment.contentType,
    };
  }

  if (!attachment.path) {
    throw new Error(
      `Attachment "${attachment.filename}" has neither "content" nor "path"`,
    );
  }

  const response = await fetch(attachment.path);

  if (!response.ok) {
    throw new Error(
      `Failed to download attachment "${attachment.filename}" from ${attachment.path}: ${response.status}`,
    );
  }

  const buffer = await response.buffer();

  return {
    filename: attachment.filename,
    content: buffer.toString('base64'),
    type:
      attachment.contentType ||
      response.headers.get('content-type') ||
      undefined,
  };
};

export const toBase64Attachments = async (
  attachments: IEmailAttachment[] = [],
): Promise<Array<{ filename: string; content: string; type?: string }>> =>
  Promise.all(attachments.map(toBase64Attachment));
