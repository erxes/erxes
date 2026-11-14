import {
  ASSISTANT_FILE_TYPES,
  type AssistantAttachment,
  AssistantFileType,
  AssistantImageType,
  assistantFileLimitMb,
  CORE_API_PREFIX,
} from '@erxes/core-contract';

const BY_EXTENSION: Record<string, AssistantFileType> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
};

const IMAGE_EDGE_MAX = 2048;

const MB = 1024 * 1024;

export const ATTACH_ACCEPT = [
  ...ASSISTANT_FILE_TYPES,
  ...Object.keys(BY_EXTENSION).map((ext) => `.${ext}`),
].join(',');

export const fileUrl = (id: string) => `${CORE_API_PREFIX}/files/${id}/download`;

export const isImage = (contentType: string) => AssistantImageType.safeParse(contentType).success;

const typeOf = (file: File) => {
  const declared = AssistantFileType.safeParse(file.type).data;

  if (declared) return declared;

  const extension = file.name.split('.').at(-1)?.toLowerCase() ?? '';

  return BY_EXTENSION[extension] ?? null;
};

export type FileCheck =
  | { ok: true; file: File }
  | { ok: false; reason: 'type' }
  | { ok: false; reason: 'size'; maxSizeMb: number };

const loadImage = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_EDGE_MAX / Math.max(bitmap.width, bitmap.height));

  const canvas = new OffscreenCanvas(
    Math.max(1, Math.round(bitmap.width * scale)),
    Math.max(1, Math.round(bitmap.height * scale)),
  );

  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return { canvas, scaled: scale < 1 };
};

const fitImage = async (file: File, maxSizeMb: number) => {
  const { canvas, scaled } = await loadImage(file);

  if (!scaled && file.size <= maxSizeMb * MB) return file;

  const blob = await canvas.convertToBlob({ type: 'image/webp', quality: 0.9 });
  const name = file.name.replace(/\.[^.]*$/, '');

  return new File([blob], `${name || 'image'}.webp`, { type: 'image/webp' });
};

export const checkFile = async (file: File): Promise<FileCheck> => {
  const type = typeOf(file);

  if (!type) return { ok: false, reason: 'type' };

  const maxSizeMb = assistantFileLimitMb(type);
  const typed = file.type === type ? file : new File([file], file.name, { type });

  const fitted =
    isImage(type) && type !== 'image/gif'
      ? await fitImage(typed, maxSizeMb).catch(() => typed)
      : typed;

  return fitted.size > maxSizeMb * MB
    ? { ok: false, reason: 'size', maxSizeMb }
    : { ok: true, file: fitted };
};

export const sizeLabel = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < MB) return `${Math.round(bytes / 1024)} KB`;

  return `${(bytes / MB).toFixed(1)} MB`;
};

export const typeLabel = ({
  name,
  contentType,
}: Pick<AssistantAttachment, 'name' | 'contentType'>) => {
  const extension = name.includes('.') ? name.split('.').at(-1) : undefined;

  return (extension ?? contentType.split('/').at(-1) ?? '').toUpperCase();
};
