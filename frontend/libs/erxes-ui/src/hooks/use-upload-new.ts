import { REACT_APP_API_URL } from 'erxes-ui/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type FileError,
  type FileRejection,
  useDropzone,
} from 'react-dropzone';
export interface FileWithPreview extends File {
  preview?: string;
  errors: readonly FileError[];
}

type UseErxesUploadOptions = {
  /**
   * Allowed MIME types for each file upload (e.g `image/png`, `text/html`, etc). Wildcards are also supported (e.g `image/*`).
   *
   * Defaults to allowing uploading of all MIME types.
   */
  allowedMimeTypes?: string[];
  /**
   * Maximum upload size of each file allowed in bytes. (e.g 1000 bytes = 1 KB)
   */
  maxFileSize?: number;
  /**
   * Maximum number of files allowed per upload.
   */
  maxFiles?: number;
  onFilesAdded?: (
    addedFiles: { name: string; url: string; type: string; size: number }[],
  ) => void;
};

type UseErxesUploadReturn = ReturnType<typeof useErxesUpload>;

const useErxesUpload = (options: UseErxesUploadOptions) => {
  const {
    allowedMimeTypes = [],
    maxFileSize = Number.POSITIVE_INFINITY,
    maxFiles = 1,
    onFilesAdded,
  } = options;

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<
    { name: string; message?: string; url?: string }[]
  >([]);
  const [successes, setSuccesses] = useState<string[]>([]);

  const isSuccess = useMemo(() => {
    if (errors.length === 0 && successes.length === 0) {
      return false;
    }
    if (errors.length === 0 && successes.length === files.length) {
      return true;
    }
    return false;
  }, [errors.length, successes.length, files.length]);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      const validFiles = acceptedFiles
        .filter((file) => !files.find((x) => x.name === file.name))
        .map((file) => {
          (file as FileWithPreview).preview = URL.createObjectURL(file);
          (file as FileWithPreview).errors = [];
          return file as FileWithPreview;
        });

      const invalidFiles = fileRejections.map(({ file, errors }) => {
        (file as FileWithPreview).preview = URL.createObjectURL(file);
        (file as FileWithPreview).errors = errors;
        return file as FileWithPreview;
      });

      const newFiles = [...files, ...validFiles, ...invalidFiles];

      setFiles(newFiles);
    },
    [files, setFiles],
  );

  const dropzoneProps = useDropzone({
    onDrop,
    noClick: true,
    accept: allowedMimeTypes.reduce(
      (acc, type) => ({ ...acc, [type]: [] }),
      {},
    ),
    maxSize: maxFileSize,
    maxFiles: maxFiles,
    multiple: maxFiles !== 1,
  });

  const onUpload = useCallback(async () => {
    setLoading(true);
    // [Joshen] This is to support handling partial successes
    // If any files didn't upload for any reason, hitting "Upload" again will only upload the files that had errors
    const filesWithErrors = errors.map((x) => x.name);
    const filesToUpload =
      filesWithErrors.length > 0
        ? [
            ...files.filter((f) => filesWithErrors.includes(f.name)),
            ...files.filter((f) => !successes.includes(f.name)),
          ]
        : files;

    const responses = await Promise.all(
      filesToUpload.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(
          `${REACT_APP_API_URL}/upload-file?kind=main`,
          {
            method: 'post',
            body: formData,
            credentials: 'include',
          },
        );

        const data = await response.text();

        if (!response.ok) {
          return { name: file.name, message: data };
        }
        return { name: file.name, message: undefined, url: data };
      }),
    );

    const responseErrors = responses.filter((x) => x.message !== undefined);
    // if there were errors previously, this function tried to upload the files again so we should clear/overwrite the existing errors.
    setErrors(responseErrors);

    const responseSuccesses = responses.filter((x) => x.message === undefined);
    const newSuccesses = Array.from(
      new Set([...successes, ...responseSuccesses.map((x) => x.name)]),
    );
    setSuccesses(newSuccesses);
    onFilesAdded?.([
      ...responseSuccesses.map((x) => ({
        name: x.name,
        url: x.url,
        type: filesToUpload.find((f) => f.name === x.name)?.type || '',
        size: filesToUpload.find((f) => f.name === x.name)?.size || 0,
      })),
    ]);
    setLoading(false);

    setTimeout(() => {
      setFiles(
        files.filter((f) => !responseSuccesses.some((x) => x.name === f.name)),
      );
      setSuccesses([]);
    }, 1000);
  }, [files, errors, successes, onFilesAdded]);

  useEffect(() => {
    if (files.length === 0) {
      setErrors([]);
    }

    // If the number of files doesn't exceed the maxFiles parameter, remove the error 'Too many files' from each file
    if (files.length <= maxFiles) {
      let changed = false;
      const newFiles = files.map((file) => {
        if (file.errors.some((e) => e.code === 'too-many-files')) {
          file.errors = file.errors.filter((e) => e.code !== 'too-many-files');
          changed = true;
        }
        return file;
      });
      if (changed) {
        setFiles(newFiles);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files.length, setFiles, maxFiles]);

  return {
    files,
    setFiles,
    successes,
    isSuccess,
    loading,
    errors,
    setErrors,
    onUpload,
    maxFileSize: maxFileSize,
    maxFiles: maxFiles,
    allowedMimeTypes,
    ...dropzoneProps,
  };
};

export {
  useErxesUpload,
  type UseErxesUploadOptions,
  type UseErxesUploadReturn,
};

export const useRemoveFile = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const removeFile = useCallback(
    async (fileName: string, afterRemove: (status: string) => void) => {
      setIsLoading(true);
      const response = await fetch(
        `${REACT_APP_API_URL}/delete-file?fileName=${fileName}`,
        {
          method: 'post',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: `fileName=${fileName}`,
        },
      );
      const data = await response.text();
      if (!response.ok) {
        setError(data);
        setIsLoading(false);
        return afterRemove(data);
      }
      setIsLoading(false);
      return afterRemove('ok');
    },
    [],
  );

  return {
    isLoading,
    error,
    removeFile,
  };
};
