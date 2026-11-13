import { z } from 'zod';

export type IAttachment = {
  url: string;
  name: string;
  size: number;
  type: string;
  duration?: number;
};

export type AttachmentContextType = {
  attachments: IAttachment[];
  addAttachment: (attachment: IAttachment) => void;
  handleRemoveAttachment: (e: React.MouseEvent, attachment: IAttachment) => Promise<void>;
  resetAttachments: () => void;
  removingUrl: string | null;
  isLoading: boolean;
};

const EXT_TO_MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  avif: 'image/avif',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  pdf: 'application/pdf',
  txt: 'text/plain',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

/** A list of addresses, or one `{ url }`. */
const storedUrls = z.union([
  z.array(z.string()),
  z.object({ url: z.string().min(1) }).transform(({ url }) => [url]),
]);

const urlsOf = (value: unknown): string[] => {
  if (typeof value !== 'string') {
    const parsed = storedUrls.safeParse(value);

    return parsed.success ? parsed.data : [];
  }

  if (!value.trim()) return [];

  try {
    const parsed = storedUrls.safeParse(JSON.parse(value));

    return parsed.success ? parsed.data : [];
  } catch {
    return [value];
  }
};

/** Attachments from a stored files value: a JSON string, an address, a list of them or `{ url }`. */
export const parseFilesAsAttachments = (value: unknown): IAttachment[] =>
  urlsOf(value).map((url) => {
    const extension = /\.(\w+)(?:[?#].*)?$/.exec(url)?.[1]?.toLowerCase() ?? '';

    return {
      url,
      name: url.split('/').pop() ?? url,
      size: 0,
      type: EXT_TO_MIME[extension] ?? 'application/octet-stream',
    };
  });
