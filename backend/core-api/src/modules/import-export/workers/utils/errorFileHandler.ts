import { nanoid } from 'nanoid';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { IModels } from '~/connectionResolvers';
import { uploadFile } from '~/utils/file/upload';

const escapeCsvField = (
  field: string | number | boolean | null | undefined,
) => {
  const value =
    field === null || field === undefined
      ? ''
      : typeof field === 'string'
      ? field
      : String(field);

  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

export const saveErrorFile = async (
  subdomain: string,
  headerRow: string[],
  errorRows: any[],
  keyToHeaderMap: Record<string, string>,
  models: IModels,
  importId?: string,
): Promise<string> => {
  const csvHeaders =
    headerRow && headerRow.length > 0
      ? headerRow
      : Object.values(keyToHeaderMap);

  const finalHeaders = [...csvHeaders, 'Error'];

  const csvLines = [finalHeaders.map(escapeCsvField).join(',')];

  const headerToKeyMap: Record<string, string> = {};
  Object.entries(keyToHeaderMap).forEach(([key, header]) => {
    headerToKeyMap[header] = key;
  });

  for (const row of errorRows) {
    const dataValues = csvHeaders.map((header) => {
      const lookupKey = headerToKeyMap[header] || header;
      return escapeCsvField(row?.[lookupKey]);
    });

    const errorMessage =
      row?.error || row?.errorMessage || row?.message || 'Unknown error';

    dataValues.push(escapeCsvField(errorMessage));

    csvLines.push(dataValues.join(','));
  }

  const tempFileName = `import-errors-${importId || nanoid()}.csv`;
  const tempFilePath = path.join(os.tmpdir(), tempFileName);

  await fs.promises.writeFile(tempFilePath, csvLines.join('\n'), 'utf8');

  try {
    const fileKey = await uploadFile(
      '',
      {
        originalFilename: tempFileName,
        filepath: tempFilePath,
        mimetype: 'text/csv',
      },
      false,
      models,
    );

    return fileKey;
  } finally {
    await fs.promises
      .unlink(tempFilePath)
      .catch(() => Promise.resolve(undefined));
  }
};
