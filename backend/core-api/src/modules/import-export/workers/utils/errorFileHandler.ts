import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { uploadFile } from '~/utils/file/upload';
import { getEnv } from 'erxes-api-shared/utils';
import { createErrorCSV } from './csvUtils';

export async function saveErrorFile(
  subdomain: string,
  headerRow: string[],
  errorRows: any[],
  keyToHeaderMap: Record<string, string>,
  models: any,
): Promise<string | null> {
  if (errorRows.length === 0) {
    return null;
  }

  try {
    const csvContent = createErrorCSV(headerRow, errorRows, keyToHeaderMap);
    const tempDir = os.tmpdir();
    const tempFileName = `import-errors-${Date.now()}.csv`;
    const tempFilePath = path.join(tempDir, tempFileName);

    await fs.promises.writeFile(tempFilePath, csvContent, 'utf-8');

    const domain = getEnv({ name: 'DOMAIN' }) || '';
    const apiUrl = domain.replace('<subdomain>', subdomain);

    const fileKey = await uploadFile(
      `${apiUrl}/gateway`,
      {
        originalFilename: tempFileName,
        filepath: tempFilePath,
        mimetype: 'text/csv',
      },
      false,
      models,
    );

    // Clean up temp file
    await fs.promises.unlink(tempFilePath).catch(() => {
      // Ignore cleanup errors
    });

    return fileKey;
  } catch (error) {
    return null;
  }
}

