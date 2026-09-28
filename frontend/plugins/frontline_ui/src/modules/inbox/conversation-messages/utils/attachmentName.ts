import type { IAttachment } from 'erxes-ui';

export const attachmentName = (attachment: IAttachment): string => {
  const name = attachment.name?.trim();
  if (name && !['file', 'attachment'].includes(name.toLowerCase())) return name;
  try {
    const url = new URL(attachment.url, 'https://attachment.local');
    if (!['https:', 'http:'].includes(url.protocol)) return name || '';
    const filename =
      url.searchParams.get('filename') || url.searchParams.get('file_name');
    if (filename) return filename;
    const basename = url.pathname.split('/').pop();
    if (basename) return decodeURIComponent(basename);
  } catch {
    // An invalid URL has no reliable filename; retain the supplied label.
  }
  return name || '';
};
