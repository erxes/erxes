export type TAiAgentContextFileVersion = {
  key: string;
  name: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
};

export type TAiAgentContextFile = TAiAgentContextFileVersion & {
  id: string;
  versions?: TAiAgentContextFileVersion[];
};

export const formatContextFileSize = (bytes?: number) => {
  const normalizedBytes = typeof bytes === 'number' ? bytes : 0;

  if (normalizedBytes >= 1024 * 1024) {
    return `${(normalizedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (normalizedBytes >= 1024) {
    return `${(normalizedBytes / 1024).toFixed(1)} KB`;
  }

  return `${normalizedBytes} B`;
};

export const formatContextFileUploadedAt = (uploadedAt?: string) => {
  if (!uploadedAt) {
    return null;
  }

  const parsed = new Date(uploadedAt);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toLocaleDateString();
};

export const getContextFileExtension = (name?: string) => {
  if (!name?.includes('.')) {
    return '';
  }

  return name.slice(name.lastIndexOf('.'));
};

export const getContextFileBaseName = (name?: string) => {
  if (!name) {
    return '';
  }

  const extension = getContextFileExtension(name);

  if (!extension) {
    return name;
  }

  return name.slice(0, -extension.length);
};

export const ensureContextFileName = (
  name: string,
  previousName?: string,
): string => {
  const trimmedName = getContextFileBaseName(name.trim());
  const previousBaseName = getContextFileBaseName(previousName);
  const previousExtension = getContextFileExtension(previousName);

  if (!trimmedName) {
    if (previousBaseName) {
      return `${previousBaseName}${previousExtension || '.md'}`;
    }

    return `context${previousExtension || '.md'}`;
  }

  return `${trimmedName}${previousExtension || '.md'}`;
};

export const createContextFileHistoryEntry = (
  file: TAiAgentContextFile | TAiAgentContextFileVersion,
): TAiAgentContextFileVersion => ({
  key: file.key,
  name: file.name,
  size: file.size,
  type: file.type,
  uploadedAt: file.uploadedAt,
});

export const getContextFileVersionCount = (file?: {
  versions?: TAiAgentContextFileVersion[];
}) => file?.versions?.length || 0;

export const mapUploadedContextFiles = (
  files: Array<{
    key: string;
    name: string;
    size?: number;
    type?: string;
    uploadedAt?: Date | string;
  }>,
): TAiAgentContextFile[] =>
  files.map(({ key, name, size, type, uploadedAt }) => ({
    id: crypto.randomUUID(),
    key,
    name,
    size,
    type,
    uploadedAt:
      uploadedAt instanceof Date
        ? uploadedAt.toISOString()
        : typeof uploadedAt === 'string'
          ? uploadedAt
          : new Date().toISOString(),
    versions: [],
  }));

export const getNextContextFilesAfterEdit = ({
  files,
  fileId,
  uploadedFile,
}: {
  files: TAiAgentContextFile[];
  fileId: string;
  uploadedFile: TAiAgentContextFile;
}) =>
  files.map((file) => {
    if (file.id !== fileId) {
      return file;
    }

    return {
      ...file,
      key: uploadedFile.key,
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      uploadedAt: uploadedFile.uploadedAt,
      versions: [createContextFileHistoryEntry(file), ...(file.versions || [])],
    };
  });
