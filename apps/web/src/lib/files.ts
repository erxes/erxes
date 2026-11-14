import type { FileInfo } from '@erxes/core-contract';
import { CORE_API_PREFIX } from '@erxes/core-contract';
import type { FileStorageAdapter } from 'erxes-ui';
import { z } from 'zod';
import { errorData, isApiError, orpc } from './api';

/** Sends the bytes where core said, reporting progress (fetch can't). */
const put = (
  url: string,
  headers: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();

    request.open('PUT', url);
    Object.entries(headers).forEach(([name, value]) => request.setRequestHeader(name, value));
    request.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
    });

    request.addEventListener('load', () =>
      request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`The upload failed (${request.status})`)),
    );
    request.addEventListener('error', () =>
      reject(new Error('The upload failed: check your connection')),
    );
    request.addEventListener('abort', () => reject(new Error('Upload cancelled')));
    signal?.addEventListener('abort', () => request.abort(), { once: true });
    request.send(file);
  });

/** Browsers leave some types empty; core needs one. */
const contentTypeOf = (file: File) => file.type || 'application/octet-stream';

/**
 * Uploads a file to core's file service: core checks it against the
 * organisation's settings and returns a link (local disk or S3 / R2), the
 * browser sends the bytes there directly, then core confirms the stored file.
 */
export const uploadFile = async (
  file: File,
  options: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {},
): Promise<FileInfo> => {
  const { file: pending, upload } = await orpc.files.createUpload.call({
    name: file.name,
    contentType: contentTypeOf(file),
    size: file.size,
  });

  await put(upload.url, upload.headers, file, options.onProgress, options.signal);

  return orpc.files.complete.call({ id: pending.id });
};

const FILE_URL = new RegExp(`^${CORE_API_PREFIX}/files/([^/?#]+)/download`);

/** The file id in a stored address (`/core/v1/files/<id>/download`). */
const fileIdOf = (address: string) => FILE_URL.exec(address)?.[1] ?? null;

const tooLarge = z.object({ maxSizeMb: z.number() });

/** A readable message for upload errors (size and type limits name them). */
export const uploadErrorMessage = (error: unknown) => {
  if (isApiError(error, 'FILE_TOO_LARGE')) {
    const limit = errorData(error, tooLarge)?.maxSizeMb;

    return limit ? `Files can be up to ${limit} MB` : error.message;
  }

  return error instanceof Error ? error.message : 'The upload failed';
};

/**
 * erxes-ui's upload hooks (avatars, editor images, attachments) and plugin
 * UIs store files through this. The address kept is the file's stable URL,
 * which `readImage` shows as is.
 */
export const coreFileStorage: FileStorageAdapter = {
  async upload(file, options) {
    try {
      return (await uploadFile(file, options)).url;
    } catch (error) {
      throw new Error(uploadErrorMessage(error), { cause: error });
    }
  },
  async remove(address) {
    const id = fileIdOf(address);

    if (id) {
      await orpc.files.remove.call({ id });
    }
  },
};
