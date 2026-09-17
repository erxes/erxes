import { DEFAULT_MAX_UPLOAD_SIZE } from '../constants';

export type PendingFile = {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  preview?: string;
  state: 'uploading' | 'error';
  error?: string;
};

export const getMaxUploadSize = (): number => {
  const configuredSize = Number.parseInt(
    localStorage.getItem('erxes_env_REACT_APP_FILE_UPLOAD_MAX_SIZE') || '',
    10,
  );
  return configuredSize > 0 ? configuredSize : DEFAULT_MAX_UPLOAD_SIZE;
};

/**
 * Downloads an attachment directly, without navigation. The plain `download`
 * attribute on an anchor is ignored for cross-origin URLs, so the file is
 * fetched as a blob first and saved from a same-origin object URL. When the
 * host does not allow CORS the fetch fails and the file opens in a new tab
 * as a fallback instead of silently doing nothing.
 */
export const downloadAttachmentFile = async (
  url: string,
  filename: string,
): Promise<void> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

export const toPendingFile = (
  file: File,
  state: PendingFile['state'],
): PendingFile => ({
  id: crypto.randomUUID(),
  file,
  name: file.name,
  type: file.type,
  size: file.size,
  preview: file.type.startsWith('image/')
    ? URL.createObjectURL(file)
    : undefined,
  state,
});
