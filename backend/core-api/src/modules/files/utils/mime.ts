export const SNIFF_BYTES = 4100;

type TSignature = { mimeType: string; offset: number; bytes: number[] };

const SIGNATURES: TSignature[] = [
  { mimeType: 'application/pdf', offset: 0, bytes: [0x25, 0x50, 0x44, 0x46] },
  { mimeType: 'image/png', offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mimeType: 'image/jpeg', offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mimeType: 'image/gif', offset: 0, bytes: [0x47, 0x49, 0x46, 0x38] },
  { mimeType: 'image/webp', offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] },
  { mimeType: 'video/mp4', offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] },
  { mimeType: 'video/webm', offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] },
  { mimeType: 'audio/mpeg', offset: 0, bytes: [0x49, 0x44, 0x33] },
  { mimeType: 'application/zip', offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04] },
];

// docx/xlsx/pptx are zip containers; the extension tells them apart.
const ZIP_CONTAINERS: Record<string, string> = {
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const TEXT_TYPES: Record<string, string> = {
  txt: 'text/plain',
  md: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
};

const matches = (head: Buffer, { offset, bytes }: TSignature) =>
  head.length >= offset + bytes.length &&
  bytes.every((byte, i) => head[offset + i] === byte);

const looksLikeText = (head: Buffer) => !head.includes(0x00);

export const getExtension = (name: string) => {
  const dot = name.lastIndexOf('.');

  return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
};

export const sniffMimeType = (head: Buffer, fileName: string) => {
  const ext = getExtension(fileName);
  const signature = SIGNATURES.find((sig) => matches(head, sig));

  if (signature?.mimeType === 'application/zip') {
    return ZIP_CONTAINERS[ext] || 'application/zip';
  }

  if (signature) {
    return signature.mimeType;
  }

  if (TEXT_TYPES[ext] && looksLikeText(head)) {
    return TEXT_TYPES[ext];
  }

  return 'application/octet-stream';
};

// Never inline anything that can run script (html, svg, xml).
const INLINE_SAFE = /^(image\/(png|jpeg|gif|webp)|video\/|audio\/|application\/pdf$|text\/plain$)/;

export const canServeInline = (mimeType: string) => INLINE_SAFE.test(mimeType);
