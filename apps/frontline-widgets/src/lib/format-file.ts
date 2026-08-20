/**
 * Formats a byte size into a human-readable string.
 * @param bytes - The file size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "4.5 MB")
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export type AttachmentType =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'document'
  | 'spreadsheet'
  | 'archive'
  | 'code'
  | 'file';

/**
 * Determines the file type category based on MIME type or file name/extension.
 * @param mimeType - The MIME type of the file (e.g., "image/png")
 * @param fileName - Optional file name or extension (e.g., "archive.zip")
 * @returns A standardized AttachmentType category
 */
export function getAttachmentType(
  mimeType?: string,
  fileName?: string,
): AttachmentType {
  const type = mimeType?.toLowerCase() || '';
  const name = fileName?.toLowerCase() || '';

  // Check by MIME type prefix
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';

  // Check specific common types
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';

  if (
    type.includes('wordprocessingml') ||
    type.includes('msword') ||
    type.includes('text/plain') ||
    name.match(/\.(doc|docx|txt|rtf|odt)$/)
  ) {
    return 'document';
  }

  if (
    type.includes('spreadsheet') ||
    type.includes('excel') ||
    type.includes('csv') ||
    name.match(/\.(xls|xlsx|csv|ods)$/)
  ) {
    return 'spreadsheet';
  }

  if (
    type.includes('zip') ||
    type.includes('tar') ||
    type.includes('compressed') ||
    type.includes('rar') ||
    name.match(/\.(zip|tar|gz|rar|7z)$/)
  ) {
    return 'archive';
  }

  if (
    type.includes('json') ||
    type.includes('javascript') ||
    type.includes('xml') ||
    name.match(/\.(js|ts|tsx|jsx|json|html|css|py|java|c|cpp)$/)
  ) {
    return 'code';
  }

  return 'file';
}
