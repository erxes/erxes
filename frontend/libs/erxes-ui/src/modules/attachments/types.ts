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
  handleRemoveAttachment: (
    e: React.MouseEvent,
    attachment: IAttachment,
  ) => void;
  resetAttachments: () => void;
  removingUrl: string | null;
  isLoading: boolean;
};

export type AttachmentSavePayload = {
  attachments: IAttachment[];
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

export const parseFilesAsAttachments = (value: unknown): IAttachment[] => {
  let urls: string[] = [];
  if (!value) return [];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) urls = parsed;
      else if (parsed?.url) urls = [parsed.url];
    } catch {
      urls = [value];
    }
  } else if (Array.isArray(value)) {
    urls = value as string[];
  } else if (typeof value === 'object' && value !== null && 'url' in value) {
    urls = [(value as { url: string }).url];
  }
  return urls.map((url) => {
    const ext = url.split('?')[0].split('.').pop()?.toLowerCase() ?? '';
    return {
      url,
      name: url.split('/').pop() ?? url,
      size: 0,
      type: EXT_TO_MIME[ext] ?? 'application/octet-stream',
    };
  });
};