import {
  AGENTS_FILE_MAX_BYTES,
  AGENTS_FILE_MAX_PER_TURN,
  AGENTS_FILE_TEXT_MAX_BYTES,
  AGENTS_FILE_TEXT_TOTAL_MAX_BYTES,
  AGENTS_IMAGE_MAX_BYTES,
  extensionForMimeType,
  isAgentsAcceptedMimeType,
  isAgentsTextMimeType,
  mimeFromFile,
} from '../agentsFiles';

export const AGENTS_ACCEPTED_TYPES_LABEL =
  'images, PDF, Word, Excel, PowerPoint, OpenDocument, RTF, CSV, text, Markdown or JSON';

export type TAgentsFileKind =
  | 'image'
  | 'pdf'
  | 'word'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'csv'
  | 'json'
  | 'markdown'
  | 'text'
  | 'file';

const FILE_TYPES: Record<string, { kind: TAgentsFileKind; label: string }> = {
  'application/pdf': { kind: 'pdf', label: 'PDF' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    kind: 'word',
    label: 'Word',
  },
  'application/vnd.oasis.opendocument.text': {
    kind: 'document',
    label: 'OpenDocument text',
  },
  'application/rtf': { kind: 'document', label: 'Rich text' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    kind: 'spreadsheet',
    label: 'Excel',
  },
  'application/vnd.oasis.opendocument.spreadsheet': {
    kind: 'spreadsheet',
    label: 'OpenDocument sheet',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    kind: 'presentation',
    label: 'PowerPoint',
  },
  'application/vnd.oasis.opendocument.presentation': {
    kind: 'presentation',
    label: 'OpenDocument slides',
  },
  'text/csv': { kind: 'csv', label: 'CSV' },
  'application/json': { kind: 'json', label: 'JSON' },
  'text/markdown': { kind: 'markdown', label: 'Markdown' },
  'text/plain': { kind: 'text', label: 'Text' },
};

export const agentsFileKind = (mimeType: string): TAgentsFileKind =>
  mimeType.startsWith('image/')
    ? 'image'
    : (FILE_TYPES[mimeType]?.kind ?? 'file');

export const agentsFileKindLabel = (mimeType: string): string =>
  mimeType.startsWith('image/')
    ? 'Image'
    : (FILE_TYPES[mimeType]?.label ?? 'File');

/** Binary units, matching the MiB/KiB limits quoted in the composer. */
export const formatAgentsFileSize = (bytes: number): string => {
  if (!Number.isFinite(bytes) || bytes < 1024) {
    return `${Math.max(0, Math.round(bytes || 0))} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb < 10 ? mb.toFixed(1) : Math.round(mb)} MB`;
};

export interface IAgentsAttachmentCandidate {
  file: File;
  mimeType: string;
  /** Validation failure shown on the chip; the file is never uploaded. */
  error?: string;
  /** Large photos/screenshots are downscaled before upload. */
  resize: boolean;
}

export interface IAgentsAttachmentPlan {
  accepted: IAgentsAttachmentCandidate[];
  /** Names of files whose type the agent cannot take. */
  unsupported: string[];
  /** Names of supported files beyond the per-message limit. */
  overflow: string[];
}

/**
 * Shared admission for picker, drop and paste: type, count, size and the
 * per-message text budget. `textBytesInUse` counts text already attached.
 */
export const planAgentsAttachments = (
  files: File[],
  { remainingSlots, textBytesInUse }: {
    remainingSlots: number;
    textBytesInUse: number;
  },
): IAgentsAttachmentPlan => {
  const unsupported: string[] = [];
  const supported: { file: File; mimeType: string }[] = [];
  files.forEach((file) => {
    const mimeType = mimeFromFile(file);
    if (isAgentsAcceptedMimeType(mimeType)) supported.push({ file, mimeType });
    else unsupported.push(file.name || 'Unnamed file');
  });

  const slots = Math.max(0, remainingSlots);
  const overflow = supported.slice(slots).map(({ file }) => file.name);
  let textBytes = textBytesInUse;
  const accepted = supported.slice(0, slots).map(({ file, mimeType }) => {
    const textFile = isAgentsTextMimeType(mimeType);
    let error: string | undefined;
    let resize = false;
    if (file.size <= 0) {
      error = 'File is empty.';
    } else if (file.size > AGENTS_FILE_MAX_BYTES) {
      error = 'File is too large. Files must be at most 10 MiB.';
    } else if (textFile && file.size > AGENTS_FILE_TEXT_MAX_BYTES) {
      error =
        'Text attachments must be at most 64 KiB each. Split the file and retry.';
    } else if (
      textFile &&
      textBytes + file.size > AGENTS_FILE_TEXT_TOTAL_MAX_BYTES
    ) {
      error =
        'Text attachments must total at most 128 KiB per message. Send fewer files.';
    } else if (textFile) {
      textBytes += file.size;
    } else if (
      mimeType.startsWith('image/') &&
      file.size > AGENTS_IMAGE_MAX_BYTES
    ) {
      if (mimeType === 'image/gif') {
        error = 'GIF images must be at most 2 MiB.';
      } else {
        resize = true;
      }
    }
    return { file, mimeType, error, resize };
  });

  return { accepted, unsupported, overflow };
};

const describeNames = (names: string[]): string =>
  names.length === 1 ? names[0] : `${names.length} files`;

/** Toast copy for files that never became chips; undefined when none. */
export const describeAgentsAttachmentRejections = (
  plan: Pick<IAgentsAttachmentPlan, 'unsupported' | 'overflow'>,
): string | undefined => {
  const messages: string[] = [];
  if (plan.unsupported.length) {
    messages.push(
      `${describeNames(plan.unsupported)} ${
        plan.unsupported.length === 1 ? "isn't a supported type" : "aren't supported types"
      }. Attach ${AGENTS_ACCEPTED_TYPES_LABEL}.`,
    );
  }
  if (plan.overflow.length) {
    messages.push(
      `Up to ${AGENTS_FILE_MAX_PER_TURN} files can be attached per message; ${describeNames(
        plan.overflow,
      )} ${plan.overflow.length === 1 ? "wasn't" : "weren't"} added.`,
    );
  }
  return messages.length ? messages.join(' ') : undefined;
};

const GENERIC_PASTE_NAME = /^image\.(png|jpe?g|gif|webp)$/i;

const pad = (value: number): string => String(value).padStart(2, '0');

/**
 * Files from a paste. Rich text copies (Excel cells, Word paragraphs) also
 * carry a rendered image; those stay a text paste. Screenshots and the
 * browser's generic `image.png` get a readable, timestamped name.
 */
export const filesFromClipboard = (
  data: Pick<DataTransfer, 'files' | 'types'> | null | undefined,
  now: Date = new Date(),
): File[] => {
  if (!data) return [];
  const types = Array.from(data.types ?? []);
  if (types.includes('text/html') && types.includes('text/plain')) return [];
  const files = Array.from(data.files ?? []);
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate(),
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  let generic = 0;
  return files.map((file) => {
    if (file.name && !GENERIC_PASTE_NAME.test(file.name)) return file;
    const ext = extensionForMimeType(file.type) ?? 'png';
    generic += 1;
    const suffix = generic > 1 ? `-${generic}` : '';
    return new File([file], `pasted-image-${stamp}${suffix}.${ext}`, {
      type: file.type,
      lastModified: file.lastModified,
    });
  });
};

/** Largest size within `maxEdge` that keeps the aspect ratio; never upscales. */
export const fitImageDimensions = (
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } => {
  const scale = Math.min(1, maxEdge / Math.max(width, height, 1));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
};
