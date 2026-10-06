import { getTelegramFile } from '@/integrations/telegram/client';
import {
  MAX_TELEGRAM_DOWNLOAD_BYTES,
  TelegramFileTooLargeError,
} from './fileLimits';
export { MAX_TELEGRAM_DOWNLOAD_BYTES } from './fileLimits';

/** Downloads a validated Telegram file path within the 20 MB limit and timeout. */
export const downloadTelegramFile = async (
  token: string,
  fileId: string,
): Promise<Buffer> => {
  const file = await getTelegramFile(token, fileId);

  if (
    file.file_size !== undefined &&
    file.file_size > MAX_TELEGRAM_DOWNLOAD_BYTES
  ) {
    throw new TelegramFileTooLargeError();
  }

  const segments = file.file_path.split('/');

  if (
    segments.some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error('Telegram returned an invalid file path.');
  }

  const encodedPath = segments.map(encodeURIComponent).join('/');
  const controller = new AbortController();

  try {
    const response = await fetch(
      `https://api.telegram.org/file/bot${token}/${encodedPath}`,
      {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(30_000),
        ]),
        redirect: 'error',
      },
    ).catch(() => {
      throw new Error(
        'Could not download the Telegram file. Please try again.',
      );
    });

    if (!response.ok) {
      throw new Error(
        `Telegram file download failed (HTTP ${response.status}).`,
      );
    }

    const declaredSize = Number(response.headers.get('content-length'));

    if (declaredSize > MAX_TELEGRAM_DOWNLOAD_BYTES) {
      throw new TelegramFileTooLargeError();
    }

    if (!response.body) {
      throw new Error('Telegram returned no file data.');
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let receivedBytes = 0;

    try {
      while (true) {
        const { done, value } = await reader.read().catch(() => {
          throw new Error(
            'The Telegram file download was interrupted. Please try again.',
          );
        });

        if (done) {
          break;
        }

        receivedBytes += value.byteLength;

        if (receivedBytes > MAX_TELEGRAM_DOWNLOAD_BYTES) {
          throw new TelegramFileTooLargeError();
        }

        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }

    return Buffer.concat(chunks, receivedBytes);
  } finally {
    controller.abort();
  }
};
