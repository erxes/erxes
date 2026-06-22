import { REACT_APP_API_URL, formatBytes } from 'erxes-ui';
import { ChatAttachment } from '~/modules/chat/types';

// File size for chips/cards — defers to the erxes-ui house formatter, keeping
// the empty-string behaviour for missing/zero sizes.
export const formatFileSize = (size?: number): string =>
  !size || size <= 0 ? '' : formatBytes(size);

export const isImageAttachment = (att: { name: string; type?: string }) =>
  att.type?.startsWith('image/') ||
  /\.(png|jpe?g|gif|webp|svg|bmp|avif)$/i.test(att.name);

export const attachmentSrc = (att: ChatAttachment) =>
  /^https?:\/\//i.test(att.url)
    ? att.url
    : `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
        att.url,
      )}&inline=true&name=${encodeURIComponent(att.name)}`;

// Upload one file through core's /upload-file (same endpoint and storage the
// rest of erxes uses). Returns the storage key or public URL.
export const uploadToStorage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Upload failed (HTTP ${res.status})`);
  }
  return text.replace(/^"|"$/g, '');
};
