import { randomUUID } from 'node:crypto';
import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import {
  readFileFromStorage,
  uploadFileToStorage,
} from 'erxes-api-shared/utils';
import {
  IMailAttachment,
  TMailAttachmentDisposition,
} from '@/integrations/mail/@types/message';
import { debugError } from '@/integrations/mail/debuggers';
import { describeError } from '@/integrations/mail/utils/errors';

export interface IInboundAttachment {
  filename?: string;
  mimeType?: string;
  contentId?: string;
  disposition?: TMailAttachmentDisposition;
  content?: string;
  url?: string;
  size?: number;
}

export const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;

const upload = async (
  subdomain: string,
  fileName: string,
  mimeType: string | undefined,
  buffer: Buffer,
) => {
  const filePath = join(tmpdir(), `mail-${randomUUID()}-${fileName}`);

  try {
    await fsPromises.writeFile(filePath, buffer as Uint8Array);

    return await uploadFileToStorage({
      subdomain,
      filePath,
      fileName,
      mimetype: mimeType || 'application/octet-stream',
    });
  } catch (e) {
    debugError(`Failed to upload attachment ${fileName}:`, e);

    return undefined;
  } finally {
    await fsPromises.rm(filePath, { force: true }).catch(() => undefined);
  }
};

const isFetchableUrl = (source: string) => {
  try {
    const { protocol } = new URL(source);

    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
};

export const readAttachmentBytes = async (
  subdomain: string,
  source: string,
) => {
  if (isFetchableUrl(source)) {
    return await downloadAttachment(source);
  }

  const buffer = await readFileFromStorage({ subdomain, key: source });

  if (!buffer) {
    throw new Error(`Attachment "${source}" is no longer in storage`);
  }

  if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment exceeds the ${MAX_ATTACHMENT_BYTES} byte limit`,
    );
  }

  return buffer;
};

export const downloadAttachment = async (source: string) => {
  const { protocol } = new URL(source);

  if (protocol !== 'https:' && protocol !== 'http:') {
    throw new Error(`Unsupported attachment protocol ${protocol}`);
  }

  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(`Attachment download failed with ${response.status}`);
  }

  const declared = Number(response.headers.get('content-length') ?? 0);

  if (declared > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment exceeds the ${MAX_ATTACHMENT_BYTES} byte limit`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment exceeds the ${MAX_ATTACHMENT_BYTES} byte limit`,
    );
  }

  return buffer;
};

const readContent = async (
  attachment: IInboundAttachment,
): Promise<{ buffer?: Buffer; error?: string }> => {
  if (attachment.content) {
    return { buffer: Buffer.from(attachment.content, 'base64') };
  }

  if (!attachment.url) {
    return { error: 'the message carried no content for this attachment' };
  }

  try {
    return { buffer: await downloadAttachment(attachment.url) };
  } catch (e) {
    debugError(`Failed to download attachment ${attachment.filename}:`, e);

    return { error: describeError(e) };
  }
};

const storeOne = async (
  subdomain: string,
  attachment: IInboundAttachment,
): Promise<IMailAttachment> => {
  const fileName = basename(
    attachment.filename || `attachment-${randomUUID()}`,
  );

  const metadata: IMailAttachment = {
    filename: fileName,
    mimeType: attachment.mimeType,
    type: attachment.mimeType,
    size: attachment.size,
    url: attachment.url,
    contentId: attachment.contentId,
    disposition: attachment.disposition,
  };

  const { buffer, error } = await readContent(attachment);

  if (!buffer) {
    return { ...metadata, error };
  }

  metadata.size = buffer.byteLength;

  if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    return {
      ...metadata,
      error: `the attachment is larger than the ${MAX_ATTACHMENT_BYTES} byte limit`,
    };
  }

  const url = await upload(subdomain, fileName, attachment.mimeType, buffer);

  return url
    ? { ...metadata, url }
    : { ...metadata, error: 'the attachment could not be stored' };
};

export const storeAttachments = async (
  subdomain: string,
  attachments: IInboundAttachment[] = [],
): Promise<IMailAttachment[]> =>
  Promise.all(attachments.map((attachment) => storeOne(subdomain, attachment)));

export const hasUnstoredAttachment = (attachments: IMailAttachment[]) =>
  attachments.some((attachment) => Boolean(attachment.error));

export const resolveInlineImages = (
  html: string,
  attachments: IMailAttachment[],
) => {
  const inline = attachments.filter(
    (attachment) => attachment.contentId && attachment.url,
  );

  if (!html || !inline.length) {
    return html;
  }

  return inline.reduce(
    (acc, attachment) =>
      acc.split(`cid:${attachment.contentId}`).join(attachment.url as string),
    html,
  );
};
