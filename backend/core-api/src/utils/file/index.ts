import { fileTypeFromBuffer } from 'file-type/core';
import * as fs from 'fs';
import { Jimp } from 'jimp';
import { tmpdir } from 'os';
import * as path from 'path';
import { IModels } from '~/connectionResolvers';
import { getConfig } from '~/modules/organization/settings/utils/configs';

export * from './delete';
export * from './instance';
export * from './upload';

export const resizeImage = async (
  file: any,
  maxWidth?: number,
  maxHeight?: number,
) => {
  try {
    if (!file?.filepath || !isValidPath(file.filepath)) {
      throw new Error('Invalid or unsafe file path');
    }

    let image: typeof Jimp.prototype = await Jimp.read(`${file.filepath}`);

    if (!image) {
      throw new Error('Error reading image');
    }

    const { width, height } = image.bitmap;

    if (maxWidth && width > maxWidth) {
      image = image.resize({ w: maxWidth });
    } else if (maxHeight && height > maxHeight) {
      image = image.resize({ h: maxHeight });
    }

    await image.write(file.filepath);

    return file;
  } catch (error) {
    console.error(error);
    return file;
  }
};

/*
 * Check that given file is not harmful
 */
export const checkFile = async (
  models: IModels,
  file,
  source?: string | string[],
) => {
  if (!file) {
    throw new Error('Invalid file');
  }

  if (!isValidPath(file.filepath)) {
    throw new Error('Invalid or unsafe file path');
  }

  const { size } = file;

  // 20mb
  if (size > 20 * 1024 * 1024) {
    return 'Too large file';
  }

  // read file
  const buffer = await fs.promises.readFile(file.filepath);

  // determine file type using magic numbers
  const ft = await fileTypeFromBuffer(buffer);

  const unsupportedMimeTypes = [
    'text/csv',
    'image/svg+xml',
    'text/plain',
    'application/vnd.ms-excel',
    'audio/mp3',
    'audio/vnd.wave',
    'audio/wave',
  ];

  const oldMsOfficeDocs = [
    'application/msword',
    'application/vnd.ms-excel',
    'application/vnd.ms-powerpoint',
  ];
  // allow csv, svg to be uploaded
  if (!ft && unsupportedMimeTypes.includes(file.mimetype)) {
    return 'ok';
  }

  if (!ft) {
    return 'Invalid file type';
  }

  let { mime } = ft;

  if (
    mime === 'application/zip' &&
    file.originalFilename?.toLowerCase().endsWith('.hwpx')
  ) {
    mime = 'application/haansoft-hwpml';
  }

  if (
    mime === 'application/x-msi' &&
    file.originalFilename?.toLowerCase().endsWith('.hwp')
  ) {
    mime = 'application/haansoft-hwp';
  }

  // allow old ms office docs to be uploaded
  if (mime === 'application/x-msi' && oldMsOfficeDocs.includes(file.mimetype)) {
    return 'ok';
  }

  const defaultMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/pdf',
    'image/gif',
    'audio/mp4',
    'audio/vnd.wave',
    'audio/wave',
  ];

  if (Array.isArray(source)) {
    source = source[0];
  }

  const UPLOAD_FILE_TYPES = await getConfig(
    source === 'widgets' ? 'WIDGETS_UPLOAD_FILE_TYPES' : 'UPLOAD_FILE_TYPES',
    '',
    models,
  );

  if (
    !(UPLOAD_FILE_TYPES && UPLOAD_FILE_TYPES.includes(mime)) &&
    !defaultMimeTypes.includes(mime)
  ) {
    return 'Invalid configured file type';
  }

  return 'ok';
};

export const isValidPath = (filepath: string): boolean => {
  const resolved = path.resolve(filepath);
  const tempDir = path.resolve(tmpdir());
  return resolved.startsWith(tempDir);
};
