import fetch from 'node-fetch';
import { IEmailAttachment } from './types';

const DOWNLOAD_TIMEOUT_MS = 15000;
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

export const toBase64Attachment = async (
  attachment: IEmailAttachment,
): Promise<{
  filename: string;
  content: string;
  type?: string;
  disposition?: 'inline';
  contentId?: string;
}> => {
  if (attachment.content) {
    return {
      filename: attachment.filename,
      content: attachment.content,
      type: attachment.contentType,
      disposition: attachment.cid ? 'inline' : undefined,
      contentId: attachment.cid,
    };
  }

  if (!attachment.path) {
    throw new Error(
      `Attachment "${attachment.filename}" has neither "content" nor "path"`,
    );
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DOWNLOAD_TIMEOUT_MS);

  let response;

  try {
    response = await fetch(attachment.path, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to download attachment "${attachment.filename}" from ${attachment.path}: ${response.status}`,
    );
  }

  const declaredSize = Number(response.headers.get('content-length'));

  if (declaredSize && declaredSize > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment "${attachment.filename}" exceeds the ${
        MAX_ATTACHMENT_BYTES / (1024 * 1024)
      }MB limit`,
    );
  }

  const buffer = await response.buffer();

  if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment "${attachment.filename}" exceeds the ${
        MAX_ATTACHMENT_BYTES / (1024 * 1024)
      }MB limit`,
    );
  }

  return {
    filename: attachment.filename,
    content: buffer.toString('base64'),
    type:
      attachment.contentType ||
      response.headers.get('content-type') ||
      undefined,
    disposition: attachment.cid ? 'inline' : undefined,
    contentId: attachment.cid,
  };
};

export const toBase64Attachments = async (
  attachments: IEmailAttachment[] = [],
): Promise<
  Array<{
    filename: string;
    content: string;
    type?: string;
    disposition?: 'inline';
    contentId?: string;
  }>
> => Promise.all(attachments.map(toBase64Attachment));
