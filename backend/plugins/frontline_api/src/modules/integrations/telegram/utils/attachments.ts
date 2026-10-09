import { promises as fsPromises } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import type { IAttachment } from 'erxes-api-shared/core-types';
import { sanitizeFilename, uploadFileToStorage } from 'erxes-api-shared/utils';
import { downloadTelegramFile } from '@/integrations/telegram/utils/downloadFile';

/** Downloads bounded provider media into workspace storage and removes temporary files. */
export const storeTelegramAttachment = async ({
  subdomain,
  token,
  fileId,
  fileName,
  mimeType,
}: {
  subdomain: string;
  token: string;
  fileId: string;
  fileName?: string;
  mimeType?: string;
}): Promise<IAttachment> => {
  const name =
    sanitizeFilename(
      basename(fileName?.replace(/\\/g, '/') || 'telegram-file'),
    ) || 'telegram-file';

  const type = mimeType?.trim() || 'application/octet-stream';
  const buffer = await downloadTelegramFile(token, fileId);

  let temporaryDirectory: string | undefined;

  try {
    temporaryDirectory = await fsPromises.mkdtemp(join(tmpdir(), 'telegram-'));

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

    return {
      name,
      type,
      url,
      size: buffer.byteLength,
    };
  } catch {
    throw new Error(
      'Could not store the Telegram attachment. Check file upload settings.',
    );
  } finally {
    if (temporaryDirectory) {
      await fsPromises
        .rm(temporaryDirectory, { recursive: true, force: true })
        .catch(() => undefined);
    }
  }
};
