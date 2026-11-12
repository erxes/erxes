import { useState } from 'react';
import { type FileError, type FileRejection, useDropzone } from 'react-dropzone';
import { errorMessage, removeStoredFile, storeFile } from '../utils/file-storage';

export type FileWithPreview = File & {
  preview?: string;
  errors: readonly FileError[];
};

type UseErxesUploadOptions = {
  /** Allowed MIME types (`image/png`, `image/*`); every type when empty. */
  allowedMimeTypes?: string[];
  /** Largest file in bytes. */
  maxFileSize?: number;
  /** Most files in one upload. */
  maxFiles?: number;
  onFilesAdded?: (addedFiles: { name: string; url: string; type: string; size: number }[]) => void;
};

type FileUploadResponse = {
  name: string;
  message: string | undefined;
  url?: string;
};

const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  try {
    return { name: file.name, message: undefined, url: await storeFile(file) };
  } catch (error) {
    return { name: file.name, message: errorMessage(error, 'Upload failed') };
  }
};

const withPreview = (file: File, errors: readonly FileError[]): FileWithPreview =>
  Object.assign(file, { preview: URL.createObjectURL(file), errors });

const withoutTooMany = (file: FileWithPreview): FileWithPreview =>
  file.errors.some((e) => e.code === 'too-many-files')
    ? Object.assign(file, { errors: file.errors.filter((e) => e.code !== 'too-many-files') })
    : file;

/** Which files the next upload sends: retries of failed ones and those not uploaded yet. */
const pendingFiles = (files: FileWithPreview[], failed: string[], uploaded: string[]) =>
  failed.length > 0
    ? [
        ...files.filter((f) => failed.includes(f.name)),
        ...files.filter((f) => !uploaded.includes(f.name)),
      ]
    : files;

const hasUrl = (response: FileUploadResponse): response is FileUploadResponse & { url: string } =>
  response.message === undefined && typeof response.url === 'string';

/** Upload state for a dropzone: picked files, their errors, and the upload of the batch. */
const useUploadBatch = (maxFiles: number, onFilesAdded: UseErxesUploadOptions['onFilesAdded']) => {
  const [files, setFilesState] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FileUploadResponse[]>([]);
  const [successes, setSuccesses] = useState<string[]>([]);

  // Fewer files than the limit clears the "too many files" errors; no files clears the rest.
  const setFiles = (next: FileWithPreview[]) => {
    setFilesState(next.length <= maxFiles ? next.map(withoutTooMany) : next);

    if (next.length === 0) setErrors([]);
  };

  const onUpload = async () => {
    setLoading(true);

    const toUpload = pendingFiles(
      files,
      errors.map((x) => x.name),
      successes,
    );

    const responses = await Promise.all(toUpload.map(uploadFile));
    const uploaded = responses.filter(hasUrl);
    const fileNamed = (name: string) => toUpload.find((f) => f.name === name);

    setErrors(responses.filter((x) => x.message !== undefined));
    setSuccesses([...new Set([...successes, ...uploaded.map((x) => x.name)])]);
    onFilesAdded?.(
      uploaded.map((x) => ({
        name: x.name,
        url: x.url,
        type: fileNamed(x.name)?.type ?? '',
        size: fileNamed(x.name)?.size ?? 0,
      })),
    );
    setLoading(false);

    setTimeout(() => {
      setFiles(files.filter((f) => !uploaded.some((x) => x.name === f.name)));
      setSuccesses([]);
    }, 1000);
  };

  return { files, setFiles, loading, errors, setErrors, successes, onUpload };
};

export const useErxesUpload = ({
  allowedMimeTypes = [],
  maxFileSize = Number.POSITIVE_INFINITY,
  maxFiles = 1,
  onFilesAdded,
}: UseErxesUploadOptions) => {
  const batch = useUploadBatch(maxFiles, onFilesAdded);
  const { files, setFiles, errors, successes } = batch;

  const dropzoneProps = useDropzone({
    onDrop: (acceptedFiles: File[], fileRejections: FileRejection[]) =>
      setFiles([
        ...files,
        ...acceptedFiles
          .filter((file) => !files.some((x) => x.name === file.name))
          .map((file) => withPreview(file, [])),
        ...fileRejections.map(({ file, errors: fileErrors }) => withPreview(file, fileErrors)),
      ]),
    noClick: true,
    // A document-wide drop blocker would also swallow text drops elsewhere
    preventDropOnDocument: false,
    accept: Object.fromEntries(allowedMimeTypes.map((type) => [type, []])),
    maxSize: maxFileSize,
    maxFiles,
    multiple: maxFiles !== 1,
  });

  return {
    ...batch,
    isSuccess: errors.length === 0 && successes.length > 0 && successes.length === files.length,
    uploadFile,
    maxFileSize,
    maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  };
};

export type UseErxesUploadReturn = ReturnType<typeof useErxesUpload>;

export const useRemoveFile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeFile = async (fileName: string, afterRemove: (status: string) => void) => {
    setIsLoading(true);

    try {
      await removeStoredFile(fileName);
      afterRemove('ok');
    } catch (e) {
      const message = errorMessage(e, 'Delete failed');

      setError(message);
      afterRemove(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, removeFile };
};
