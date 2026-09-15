import { defaultViberTranslate, type ViberTranslate } from './translation';
import type { ViberAttachment } from './types';
import { getViberVideoLink, isViberStorageKey } from './attachment';

export const VIBER_FILE_MAX_BYTES = 50 * 1024 * 1024;

const hasControlCharacters = (value: string): boolean =>
  Array.from(value).some(
    (character) =>
      character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127,
  );

export const uploadViberFile = async (
  file: File,
  apiUrl: string,
  t: ViberTranslate = defaultViberTranslate,
): Promise<ViberAttachment> => {
  if (!file.size || file.size > VIBER_FILE_MAX_BYTES)
    throw new Error(
      t('viber-file-size-invalid', {
        defaultValue:
          'Viber files must be non-empty and no larger than 50 MiB.',
      }),
    );
  if (
    !/^[^/\\]+\.[a-zA-Z0-9]+$/.test(file.name) ||
    file.name.length > 256 ||
    hasControlCharacters(file.name)
  ) {
    throw new Error(
      t('viber-filename-invalid', {
        defaultValue: 'Use a valid filename with a file extension.',
      }),
    );
  }
  const body = new FormData();
  const type = file.type || 'application/octet-stream';
  body.append('file', file.type ? file : new File([file], file.name, { type }));
  const response = await fetch(
    `${apiUrl.replace(/\/$/, '')}/upload-file?forcePrivate=true`,
    {
      method: 'POST',
      credentials: 'include',
      body,
      signal: AbortSignal.timeout(120_000),
    },
  );
  if (!response.ok)
    throw new Error(
      t('viber-upload-failed-help', {
        defaultValue:
          'Unable to upload this file. Check your storage settings and allowed file types.',
      }),
    );
  const key = await response.text();
  if (type.startsWith('video/') && getViberVideoLink(key)) {
    return { name: file.name, type, size: file.size, url: key };
  }
  // Only opaque storage keys may be handed to the backend's private media relay.
  if (!isViberStorageKey(key)) {
    throw new Error(
      t('viber-storage-unsupported', {
        defaultValue:
          'This storage configuration does not support Viber attachments. Contact your administrator.',
      }),
    );
  }
  return { name: file.name, type, size: file.size, url: key };
};
