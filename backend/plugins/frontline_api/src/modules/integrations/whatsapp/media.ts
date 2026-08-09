import { promises as fsPromises } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { randomUUID } from 'crypto';

import {
  readFileFromStorage,
  uploadFileToStorage,
} from 'erxes-api-shared/utils';

import { IWhatsappAttachment } from '@/integrations/whatsapp/@types';
import { debugError } from '@/integrations/whatsapp/debuggers';
import {
  downloadWhatsappMedia,
  uploadWhatsappMedia,
} from '@/integrations/whatsapp/utils';

/**
 * Moving media between WhatsApp and our own storage, in both directions.
 *
 * Both directions were missing, and both failed silently:
 *
 * INBOUND stored Meta's signed download URL directly on the attachment. That
 * URL expires after 5 MINUTES and needs a bearer token even before then, so an
 * <img src> could never render it — customer media was effectively never
 * viewable, not even briefly.
 *
 * OUTBOUND never sent attachments at all. The reply path called
 * sendWhatsappText and then wrote doc.attachments to our database, so the file
 * appeared in the agent's inbox while the recipient received text only.
 */

/** Meta keeps webhook media for 7 days; we pull it well inside that. */
const MAX_INBOUND_BYTES = 100 * 1024 * 1024;

/**
 * Copies inbound WhatsApp media into our own storage.
 *
 * Returns the storage KEY in `url`, matching how Discord's rehost behaves and
 * what /read-file expects — the frontend resolves a bare key through the
 * gateway, so this is the shape the rest of the product already understands.
 *
 * On failure the attachment is returned unchanged rather than dropped. A
 * message with an unreachable attachment is still worth showing; losing the
 * message because its image could not be copied would be worse.
 */
export const rehostInboundMedia = async ({
  subdomain,
  accessToken,
  mediaId,
  attachment,
}: {
  subdomain: string;
  accessToken: string;
  mediaId: string;
  attachment: IWhatsappAttachment;
}): Promise<IWhatsappAttachment> => {
  let tmpPath: string | undefined;

  try {
    const buffer = await downloadWhatsappMedia({ accessToken, mediaId });

    if (!buffer) return attachment;

    if (buffer.byteLength > MAX_INBOUND_BYTES) {
      debugError(
        `WhatsApp media ${mediaId} is ${buffer.byteLength} bytes; keeping the Meta URL`,
      );
      return attachment;
    }

    const fileName = basename(attachment.name || `whatsapp-${mediaId}`);

    // uploadFileToStorage takes a path, not a buffer, so the bytes go through
    // a temp file — the same route Discord's rehost uses.
    tmpPath = join(tmpdir(), `whatsapp-${randomUUID()}-${fileName}`);
    await fsPromises.writeFile(tmpPath, buffer);

    const key = await uploadFileToStorage({
      subdomain,
      filePath: tmpPath,
      fileName,
      mimetype: attachment.type || 'application/octet-stream',
    });

    return { ...attachment, url: key, size: buffer.byteLength };
  } catch (e: any) {
    debugError(
      `Failed to re-host WhatsApp media ${mediaId}, keeping the Meta URL: ${e.message}`,
    );
    return attachment;
  } finally {
    if (tmpPath) {
      await fsPromises.rm(tmpPath, { force: true }).catch(() => undefined);
    }
  }
};

/**
 * Reads one of our attachments and uploads it to Meta, returning the media id.
 *
 * Accepts either a storage key or an absolute URL, because both shapes exist in
 * the wild: attachments uploaded through the CRM are stored as keys, while
 * older rows and anything rehosted from another provider may carry a full URL.
 */
export const uploadAttachmentToWhatsapp = async ({
  subdomain,
  accessToken,
  phoneNumberId,
  attachment,
}: {
  subdomain: string;
  accessToken: string;
  phoneNumberId: string;
  attachment: IWhatsappAttachment;
}): Promise<string> => {
  const source = attachment.url || '';

  if (!source) {
    throw new Error('Attachment has no url or storage key');
  }

  const fileName = basename(attachment.name || source) || 'attachment';
  const mimetype = attachment.type || 'application/octet-stream';

  let buffer: Buffer | null = null;

  if (source.startsWith('http')) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`Could not read ${fileName}: HTTP ${response.status}`);
    }

    buffer = Buffer.from(await response.arrayBuffer());
  } else {
    buffer = await readFileFromStorage({ subdomain, key: source });
  }

  if (!buffer) {
    throw new Error(`Could not read ${fileName} from storage`);
  }

  return uploadWhatsappMedia({
    accessToken,
    phoneNumberId,
    buffer,
    fileName,
    mimetype,
  });
};
