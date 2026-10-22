import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import type { IAttachment } from 'erxes-api-shared/core-types';
import { sanitizeFilename, uploadFileToStorage } from 'erxes-api-shared/utils';
import { downloadWhatsappMedia } from '@/integrations/whatsapp/graphApi';
import { IWhatsappMediaRef } from '@/integrations/whatsapp/utils/content';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'audio/ogg': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'audio/amr': 'amr',
  'application/pdf': 'pdf',
};

/**
 * Sender-declared types kept as-is. Anything else is stored as an opaque
 * download so a customer cannot plant a page that renders in the browser.
 */
const SAFE_MIME_TYPES = new Set([
  ...Object.keys(EXTENSIONS),
  'image/gif',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

/**
 * Extensions a browser renders as an active document. Core's read-file picks
 * the inline content type from the stored name's extension, so these never
 * stay last in a stored name.
 */
const ACTIVE_EXTENSIONS = new Set([
  'svg',
  'svgz',
  'xml',
  'xsl',
  'xht',
  'xhtml',
  'htm',
  'html',
  'shtml',
  'mht',
  'mhtml',
]);

export const getSafeWhatsappMimeType = (mimeType: string) =>
  SAFE_MIME_TYPES.has(mimeType) ? mimeType : 'application/octet-stream';

const neutralizeExtension = (name: string) => {
  const extension = name.split('.').pop()?.toLowerCase() || '';

  return name.includes('.') && ACTIVE_EXTENSIONS.has(extension)
    ? `${name}.txt`
    : name;
};

const getFileName = (media: IWhatsappMediaRef, mimeType: string) => {
  if (media.fileName) {
    const name = sanitizeFilename(basename(media.fileName.replace(/\\/g, '/')));

    if (name) return neutralizeExtension(name);
  }

  const extension = EXTENSIONS[mimeType.split(';')[0].trim()];

  return extension
    ? `whatsapp-${media.kind}.${extension}`
    : `whatsapp-${media.kind}`;
};

/** Downloads webhook media from Meta into workspace storage; Meta's URL expires within minutes. */
export const storeWhatsappMedia = async ({
  subdomain,
  accessToken,
  media,
}: {
  subdomain: string;
  accessToken: string;
  media: IWhatsappMediaRef;
}): Promise<IAttachment> => {
  const { buffer, mimeType: downloadedType } = await downloadWhatsappMedia(
    accessToken,
    media.id,
  );
  const type = getSafeWhatsappMimeType(
    (media.mimeType || downloadedType || 'application/octet-stream')
      .split(';')[0]
      .trim()
      .toLowerCase(),
  );
  const name = getFileName(media, type);

  let temporaryDirectory: string | undefined;

  try {
    temporaryDirectory = await fsPromises.mkdtemp(join(tmpdir(), 'whatsapp-'));

    const filePath = join(temporaryDirectory, 'attachment');

    await fsPromises.writeFile(filePath, buffer, { mode: 0o600 });

    const url = await uploadFileToStorage({
      subdomain,
      filePath,
      fileName: name,
      mimetype: type,
    });

    if (!url.trim()) {
      throw new Error('Storage did not return a file location.');
    }

    return { name, type, url, size: buffer.byteLength };
  } finally {
    if (temporaryDirectory) {
      await fsPromises
        .rm(temporaryDirectory, { recursive: true, force: true })
        .catch(() => undefined);
    }
  }
};
