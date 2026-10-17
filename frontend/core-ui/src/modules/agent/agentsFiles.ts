import type { UIMessage } from 'ai';

export const AGENTS_FILES_DATA_TYPE = 'data-agents-files';
export const AGENTS_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const AGENTS_FILE_MAX_PER_TURN = 5;
export const AGENTS_FILE_TEXT_MAX_BYTES = 64 * 1024;
export const AGENTS_FILE_TEXT_TOTAL_MAX_BYTES = 128 * 1024;
export const AGENTS_FILE_ONLY_TEXT = 'Uploaded files';
export const AGENTS_TEXT_MIME_TYPES = [
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/json',
] as const;

export interface IAgentsFileMeta {
  name: string;
  url: string;
  type: string;
  size: number;
}

const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  txt: 'text/plain',
  md: 'text/markdown',
  markdown: 'text/markdown',
  csv: 'text/csv',
  json: 'application/json',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export const mimeFromFile = (file: Pick<File, 'name' | 'type'>): string => {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_BY_EXTENSION[ext] ?? file.type.trim().toLowerCase();
};

export const isAgentsTextMimeType = (mimeType: string): boolean =>
  (AGENTS_TEXT_MIME_TYPES as readonly string[]).includes(mimeType);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isAgentsFileMeta = (file: unknown): file is IAgentsFileMeta =>
  isRecord(file) &&
  typeof file.url === 'string' &&
  file.url.length > 0 &&
  file.url.length <= 2048 &&
  typeof file.name === 'string' &&
  file.name.length > 0 &&
  typeof file.type === 'string' &&
  Object.values(MIME_BY_EXTENSION).includes(file.type) &&
  typeof file.size === 'number' &&
  Number.isSafeInteger(file.size) &&
  file.size > 0 &&
  file.size <= AGENTS_FILE_MAX_BYTES;

export const readAgentsFilesPart = (
  part: UIMessage['parts'][number],
): IAgentsFileMeta[] => {
  if (!isRecord(part) || part.type !== AGENTS_FILES_DATA_TYPE) {
    return [];
  }

  const data = part.data;
  if (!isRecord(data) || !Array.isArray(data.files)) {
    return [];
  }

  return data.files.filter(isAgentsFileMeta).map((file) => ({
    name: file.name,
    url: file.url,
    type: file.type,
    size: file.size,
  }));
};

export const agentsFilesPart = (
  files: IAgentsFileMeta[],
): UIMessage['parts'][number] => ({
  type: AGENTS_FILES_DATA_TYPE,
  data: { files },
});

export const agentsFilesNotice = (part: UIMessage['parts'][number]): string => {
  if (part.type !== AGENTS_FILES_DATA_TYPE || !isRecord(part.data)) {
    return '';
  }
  const files = readAgentsFilesPart(part);
  const urls = part.data.textFileUrls;
  if (Array.isArray(urls)) {
    const included = files.filter((file) => urls.includes(file.url)).length;
    if (included === files.length && included > 0) {
      return 'Text contents supplied to the AI.';
    }
    if (included > 0) {
      return 'Text contents supplied to the AI. Other files are download-only.';
    }
  }
  return '';
};

export const agentsFilesDisplayText = (
  parts: UIMessage['parts'],
): string | undefined => {
  for (const part of parts) {
    if (
      part.type === AGENTS_FILES_DATA_TYPE &&
      isRecord(part.data) &&
      (Array.isArray(part.data.textFileUrls) ||
        Array.isArray(part.data.textFileIds)) &&
      typeof part.data.displayText === 'string' &&
      (readAgentsFilesPart(part).length > 0 ||
        (Array.isArray(part.data.files) && part.data.files.length > 0))
    ) {
      return part.data.displayText;
    }
  }
  return undefined;
};
