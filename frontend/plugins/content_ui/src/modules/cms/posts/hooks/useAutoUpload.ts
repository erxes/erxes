import { useEffect, useMemo, useRef } from 'react';

type UploadProps = ReturnType<typeof import('erxes-ui').useErxesUpload>;

function getFileBatchKey(files: UploadProps['files']) {
  if (!files.length) {
    return '';
  }

  return files
    .map((file) =>
      [
        file.name ?? '',
        file.size ?? '',
        file.type ?? '',
        file.lastModified ?? '',
      ].join(':'),
    )
    .join('|');
}

/**
 * Starts the erxes uploader once for each selected batch of files.
 */
export function useAutoUpload(uploadProps: UploadProps) {
  const { files, loading, onUpload } = uploadProps;
  const uploadedBatchRef = useRef<string | null>(null);
  const fileBatchKey = useMemo(() => getFileBatchKey(files), [files]);

  useEffect(() => {
    if (!files.length) {
      uploadedBatchRef.current = null;
      return;
    }

    if (!fileBatchKey || uploadedBatchRef.current === fileBatchKey || loading) {
      return;
    }

    uploadedBatchRef.current = fileBatchKey;
    onUpload().catch(() => undefined);
  }, [fileBatchKey, files.length, loading, onUpload]);
}
