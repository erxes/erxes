export const AGENTS_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const AGENTS_FILE_TEXT_MAX_BYTES = 64 * 1024;
export const AGENTS_TEXT_MIME_TYPES = [
  'text/plain', 'text/markdown', 'text/csv', 'application/json',
] as const;
export const AGENTS_IMAGE_MIME_TYPES = [
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
] as const;
export const AGENTS_ALLOWED_MIME_TYPES = [
  ...AGENTS_TEXT_MIME_TYPES,
  ...AGENTS_IMAGE_MIME_TYPES, 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;
export type IAgentsAllowedMimeType = (typeof AGENTS_ALLOWED_MIME_TYPES)[number];
export const isAgentsAllowedMimeType = (value: string): value is IAgentsAllowedMimeType =>
  (AGENTS_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
export const isAgentsTextMimeType = (value: string): value is (typeof AGENTS_TEXT_MIME_TYPES)[number] =>
  (AGENTS_TEXT_MIME_TYPES as readonly string[]).includes(value);
export const isAgentsImageMimeType = (
  value: string,
): value is (typeof AGENTS_IMAGE_MIME_TYPES)[number] =>
  (AGENTS_IMAGE_MIME_TYPES as readonly string[]).includes(value);

const startsWith = (buffer: Buffer, bytes: number[]): boolean =>
  buffer.length >= bytes.length && bytes.every((byte, index) => buffer[index] === byte);

export const sniffImageMime = (buffer: Buffer): (typeof AGENTS_IMAGE_MIME_TYPES)[number] | null => {
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return 'image/png';
  }
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return 'image/jpeg';
  }
  if (
    startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    startsWith(buffer, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return 'image/gif';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
};

/** Validation for extracted text, not a replacement for platform upload validation. */
export const validateAgentsFileBytes = (
  mimeType: (typeof AGENTS_TEXT_MIME_TYPES)[number],
  bytes: Buffer,
): void => {
  const text = bytes.toString('utf8');
  if (!bytes.length || !Buffer.from(text, 'utf8').equals(bytes) || text.includes('\0')) {
    throw new Error('Attachment must contain valid, nonempty UTF-8 text.');
  }
  if (mimeType === 'application/json') {
    JSON.parse(text);
  }
};
