import { randomUUID } from 'node:crypto';
import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { uploadFileToStorage } from 'erxes-api-shared/utils';
import { generateAttachmentUrl } from './commonUtils';
import { debugError } from './debuggers';
import { validateMediaUrl } from './urlValidation';

const MEDIA_FETCH_TIMEOUT_MS = 10000;

const downloadMedia = async (url: string): Promise<Uint8Array> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MEDIA_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'error',
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return new Uint8Array(await res.arrayBuffer());
  } finally {
    clearTimeout(timeout);
  }
};

export const uploadMedia = async (
  subdomain: string,
  url: string,
  video: boolean,
): Promise<string | null> => {
  try {
    validateMediaUrl(url);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    debugError(`SSRF protection blocked media fetch: ${message}`);
    return null;
  }

  const fileName = `${randomUUID()}.${video ? 'mp4' : 'jpg'}`;
  const tmpPath = join(tmpdir(), `facebook-${fileName}`);

  try {
    await fsPromises.writeFile(tmpPath, await downloadMedia(url));

    const key = await uploadFileToStorage({
      subdomain,
      filePath: tmpPath,
      fileName,
      mimetype: video ? 'video/mp4' : 'image/jpeg',
    });

    return generateAttachmentUrl(subdomain, key);
  } catch (e) {
    debugError(`Upload failed: ${e instanceof Error ? e.message : String(e)}`);
    return null;
  } finally {
    await fsPromises.unlink(tmpPath).catch(() => undefined);
  }
};
