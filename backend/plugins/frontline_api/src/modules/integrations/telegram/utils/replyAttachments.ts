import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { isPublicTelegramFileAddress } from './publicAddress';
export { isPublicTelegramFileAddress } from './publicAddress';
import { basename } from 'node:path';
import type { Readable } from 'node:stream';
import { z } from 'zod';
import type { TelegramSendMediaType } from '../client';
import {
  isImage,
  readFileFromStorage,
  readFileStreamFromStorage,
  sanitizeFilename,
} from 'erxes-api-shared/utils';

export const TELEGRAM_SEND_BYTES = 50 * 1024 * 1024;
export const telegramReplyAttachmentSchema = z.object({
  url: z.string().min(1),
  name: z.string().nullish(),
  type: z.string().nullish(),
  size: z.number().nonnegative().safe().nullish(),
});

/** Reads and closes a stream within the remaining reply byte budget and timeout. */
export const readBoundedTelegramFile = async (
  stream: Readable,
  limit: number,
): Promise<Buffer> => {
  const timer = setTimeout(
    () => stream.destroy(new Error('Attachment read timed out')),
    30_000,
  );
  const chunks: Buffer[] = [];
  let size = 0;
  try {
    for await (const raw of stream) {
      const chunk: unknown = raw;
      if (!(chunk instanceof Uint8Array))
        throw new Error('Invalid attachment data');
      size += chunk.byteLength;
      if (size > limit)
        throw new Error(
          'Telegram attachments must total 50 MB or less per reply.',
        );
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks, size);
  } finally {
    clearTimeout(timer);
    stream.destroy();
  }
};

/** Downloads a direct HTTPS file using the checked DNS address without redirects. */
const readPublicFile = async (url: URL, limit: number): Promise<Buffer> => {
  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    (url.port && url.port !== '443')
  ) {
    throw new Error(
      'Attachments must use workspace storage or a public HTTPS URL.',
    );
  }
  const hostname = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = await lookup(hostname, { all: true });
  if (
    !addresses.length ||
    addresses.some(({ address }) => !isPublicTelegramFileAddress(address))
  ) {
    throw new Error('Attachment URLs must resolve to a public address.');
  }
  const pinned = addresses[0];
  return new Promise<Buffer>((resolve, reject) => {
    const req = request(
      url,
      {
        // Pin the checked address; a second DNS lookup would allow rebinding.
        family: pinned.family,
        lookup: (_host, _options, callback) =>
          callback(null, pinned.address, pinned.family),
        signal: AbortSignal.timeout(30_000),
      },
      (response) => {
        if (response.statusCode !== 200) {
          response.destroy();
          reject(
            new Error(
              'Attachment URL must return a file directly, without redirects.',
            ),
          );
          return;
        }
        if (Number(response.headers['content-length']) > limit) {
          response.destroy();
          reject(
            new Error(
              'Telegram attachments must total 50 MB or less per reply.',
            ),
          );
          return;
        }
        readBoundedTelegramFile(response, limit).then(resolve, reject);
      },
    );
    req.on('error', () =>
      reject(new Error('Could not download the reply attachment.')),
    );
    req.end();
  });
};

/** Reads a validated workspace key or bounded public file through existing storage APIs. */
const readAttachment = async (
  subdomain: string,
  location: string,
  limit: number,
): Promise<Buffer> => {
  let key = location;
  if (/^https?:\/\//i.test(location) || location.startsWith('/read-file?')) {
    const url = new URL(location, 'https://workspace.invalid');
    if (url.pathname === '/read-file' && url.searchParams.get('key')) {
      key = url.searchParams.get('key') || '';
    } else return readPublicFile(url, limit);
  }
  if (
    !key ||
    key.startsWith('/') ||
    key.includes('://') ||
    key.split(/[\\/]/).some((part) => part === '..' || part === '.')
  ) {
    throw new Error('Invalid workspace attachment key.');
  }
  try {
    const stream = await readFileStreamFromStorage({ subdomain, key });
    return await readBoundedTelegramFile(stream, limit);
  } catch (error: unknown) {
    // Core uploads can store images in Cloudflare Images instead of R2. The
    // public streaming reader only covers R2; use the same image-aware reader
    // as Mail when the storage lookup fails, never after a size/stream failure.
    if (
      !isImage(key) ||
      !z.object({ code: z.literal('NoSuchKey') }).safeParse(error).success
    ) {
      throw error;
    }
    const bytes = await readFileFromStorage({ subdomain, key });
    if (!bytes || bytes.length > limit) {
      throw new Error('Reply attachment is missing or exceeds the size limit.');
    }
    return bytes;
  }
};

export interface TelegramReplyFile {
  bytes: Buffer;
  name: string;
  type: string;
  asPhoto: boolean;
  mediaType?: TelegramSendMediaType;
  url: string;
}

/** Preflights every attachment within one reply budget and detects supported media formats. */
export const prepareTelegramReplyFiles = async (
  subdomain: string,
  attachments: z.infer<typeof telegramReplyAttachmentSchema>[],
): Promise<TelegramReplyFile[]> => {
  if (attachments.length > 10)
    throw new Error('Attach at most 10 files to a Telegram reply.');
  const files: TelegramReplyFile[] = [];
  let remaining = TELEGRAM_SEND_BYTES;
  for (const attachment of attachments) {
    if ((attachment.size ?? 0) > remaining)
      throw new Error(
        'Telegram attachments must total 50 MB or less per reply.',
      );
    let bytes: Buffer;
    try {
      bytes = await readAttachment(subdomain, attachment.url, remaining);
    } catch {
      throw new Error(
        'Could not read the reply attachment. Check file storage, public HTTPS access, and the 50 MB total limit.',
      );
    }
    if (!bytes.length) throw new Error('Telegram cannot send an empty file.');
    remaining -= bytes.length;
    const jpeg = bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
    const png = bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const name =
      sanitizeFilename(
        basename(attachment.name?.replace(/\\/g, '/') || 'attachment'),
      ) || 'attachment';
    const asPhoto = (jpeg || png) && bytes.length <= 10 * 1024 * 1024;
    const mp4 = bytes.subarray(4, 8).toString('ascii') === 'ftyp';
    const mp3 =
      bytes.subarray(0, 3).toString('ascii') === 'ID3' ||
      (bytes[0] === 0xff &&
        (bytes[1] & 0xe0) === 0xe0 &&
        (bytes[1] & 0x06) !== 0);
    const opus =
      bytes.subarray(0, 4).toString('ascii') === 'OggS' &&
      bytes.subarray(0, 128).includes(Buffer.from('OpusHead'));
    const gif = /^GIF8[79]a$/.test(bytes.subarray(0, 6).toString('ascii'));
    const mediaType: TelegramSendMediaType = asPhoto
      ? 'photo'
      : opus
        ? 'voice'
        : gif
          ? 'animation'
          : mp3 || (mp4 && attachment.type === 'audio/mp4')
            ? 'audio'
            : mp4 && attachment.type === 'video/mp4'
              ? 'video'
              : 'document';
    files.push({
      bytes,
      name,
      url: attachment.url,
      type: jpeg
        ? 'image/jpeg'
        : png
          ? 'image/png'
          : opus
            ? 'audio/ogg'
            : gif
              ? 'image/gif'
              : mp3
                ? 'audio/mpeg'
                : attachment.type || 'application/octet-stream',
      asPhoto,
      mediaType,
    });
  }
  return files;
};
