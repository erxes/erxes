export const CONTEXT_FILE_ACCEPT =
  '.md,.markdown,.txt,text/markdown,text/plain';

const ACCEPTED_EXTENSIONS = ['.md', '.markdown', '.txt'];

export type TContextFileLimits = {
  existingCount: number;
  existingBytes: number;
  maxFiles: number;
  maxSingleFileBytes: number;
  maxTotalContextBytes: number;
};

export type TContextFileRejection = {
  titleKey: string;
  descriptionKey: string;
  values: Record<string, string | number>;
};

export const formatBytes = (bytes: number) =>
  bytes >= 1000 ? `${Math.round(bytes / 1000)} KB` : `${bytes} B`;

export const totalBytesOf = (files: { size?: number }[]) =>
  files.reduce((sum, file) => sum + (file.size || 0), 0);

const extensionOf = (name: string) =>
  `.${name.split('.').pop()?.toLowerCase() || ''}`;

const rejection = (
  key: string,
  values: TContextFileRejection['values'],
): TContextFileRejection => ({
  titleKey: `settings-dropzone-${key}`,
  descriptionKey: `settings-dropzone-${key}-description`,
  values,
});

/** Why one more file cannot join the ones already accepted, if it cannot. */
const rejectionOf = (
  file: File,
  accepted: File[],
  limits: TContextFileLimits,
): TContextFileRejection | null => {
  if (!ACCEPTED_EXTENSIONS.includes(extensionOf(file.name))) {
    return rejection('unsupported-format', { name: file.name });
  }

  if (file.size > limits.maxSingleFileBytes) {
    return rejection('file-too-large', {
      name: file.name,
      size: formatBytes(limits.maxSingleFileBytes),
    });
  }

  if (limits.existingCount + accepted.length >= limits.maxFiles) {
    return rejection('too-many-files', { count: limits.maxFiles });
  }

  const nextTotal = limits.existingBytes + totalBytesOf(accepted) + file.size;

  if (nextTotal > limits.maxTotalContextBytes) {
    return rejection('combined-too-large', {
      size: formatBytes(limits.maxTotalContextBytes),
    });
  }

  return null;
};

/**
 * The files to upload, or the first reason the selection is refused: one bad
 * file refuses the whole selection, as before.
 */
export const checkContextFiles = (
  selected: File[],
  limits: TContextFileLimits,
): { files: File[] } | { rejected: TContextFileRejection } => {
  const accepted: File[] = [];

  for (const file of selected) {
    const rejected = rejectionOf(file, accepted, limits);

    if (rejected) {
      return { rejected };
    }

    accepted.push(file);
  }

  return { files: accepted };
};
