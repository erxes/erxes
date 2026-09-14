import type { FormAttachment } from '../types';

const MAX_BYTES = 20 * 1024 * 1024;

export const uploadFormFile = async (
  file: File,
  apiUrl: string,
): Promise<FormAttachment> => {
  if (file.size > MAX_BYTES) {
    throw new Error('The file must be smaller than 20MB.');
  }

  const body = new FormData();
  body.append('file', file);

  const response = await fetch(`${apiUrl}/upload-file?kind=main`, {
    method: 'POST',
    body,
    credentials: 'include',
  });

  const text = (await response.text()).trim();

  if (!response.ok || !text) {
    throw new Error(text || 'Could not upload the file.');
  }

  return { name: file.name, url: text, size: file.size, type: file.type };
};

export const readableSize = (bytes: number): string =>
  bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
