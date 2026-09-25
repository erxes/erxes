import { useCallback, useEffect, useRef, useState } from 'react';
import { type IAttachment, useUpload } from 'erxes-ui';
import {
  getMaxUploadSize,
  toPendingFile,
  type PendingFile,
} from '../utils/fileUpload';

export const useAttachmentUploads = () => {
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const uploadQueueRef = useRef<File[]>([]);
  const activeUploadRef = useRef<File | null>(null);
  const sawUploadRunningRef = useRef(false);
  const pendingFilesRef = useRef<PendingFile[]>([]);
  const revokedPreviewUrlsRef = useRef(new Set<string>());
  const cancelledUploadsRef = useRef<Set<File>>(new Set());
  const { upload, isLoading: isUploadRunning } = useUpload();

  const revokePreviewUrl = useCallback((preview?: string) => {
    if (!preview || revokedPreviewUrlsRef.current.has(preview)) return;
    URL.revokeObjectURL(preview);
    revokedPreviewUrlsRef.current.add(preview);
  }, []);

  useEffect(() => {
    pendingFilesRef.current = pendingFiles;
  }, [pendingFiles]);

  useEffect(
    () => () => {
      pendingFilesRef.current.forEach(({ preview }) =>
        revokePreviewUrl(preview),
      );
    },
    [revokePreviewUrl],
  );

  const startNextUpload = useCallback(() => {
    if (activeUploadRef.current) return;

    const file = uploadQueueRef.current.shift();
    if (!file) return;

    activeUploadRef.current = file;
    const files = new DataTransfer();
    files.items.add(file);

    upload({
      files: files.files,
      afterUpload: ({ response, fileInfo }) => {
        activeUploadRef.current = null;

        if (!cancelledUploadsRef.current.delete(file)) {
          setAttachments((prev) => [
            ...prev,
            {
              url: response,
              name: fileInfo.name,
              size: fileInfo.size,
              type: fileInfo.type,
            },
          ]);
          setPendingFiles((prev) => {
            const index = prev.findIndex(
              (pending) => pending.file === file && pending.state === 'uploading',
            );
            if (index === -1) return prev;

            const next = [...prev];
            const [uploaded] = next.splice(index, 1);
            revokePreviewUrl(uploaded.preview);
            return next;
          });
        }

        startNextUpload();
      },
    });
  }, [revokePreviewUrl, upload]);

  // useUpload has no error callback. Its loading transition identifies a
  // failed upload because this queue sends one file at a time.
  useEffect(() => {
    if (isUploadRunning) {
      sawUploadRunningRef.current = true;
      return;
    }
    if (!sawUploadRunningRef.current || !activeUploadRef.current) return;

    sawUploadRunningRef.current = false;
    const failedFile = activeUploadRef.current;
    activeUploadRef.current = null;
    cancelledUploadsRef.current.delete(failedFile);
    setPendingFiles((prev) => {
      const index = prev.findIndex(
        (pending) =>
          pending.file === failedFile && pending.state === 'uploading',
      );
      if (index === -1) return prev;

      const next = [...prev];
      revokePreviewUrl(next[index].preview);
      next[index] = {
        ...next[index],
        preview: undefined,
        state: 'error',
        error: 'Upload failed. Remove and try again.',
      };
      return next;
    });
    startNextUpload();
  }, [isUploadRunning, revokePreviewUrl, startNextUpload]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    if (!files?.length) return;

    const maxUploadSize = getMaxUploadSize();
    const selected = Array.from(files);
    const accepted = selected.filter((file) => file.size <= maxUploadSize);

    setPendingFiles((prev) => [
      ...prev,
      ...selected.map((file) => {
        if (file.size <= maxUploadSize) return toPendingFile(file, 'uploading');
        return {
          ...toPendingFile(file, 'error'),
          error: `Larger than ${Math.round(maxUploadSize / 1024 / 1024)}MB`,
        };
      }),
    ]);

    event.target.value = '';
    if (accepted.length === 0) return;

    uploadQueueRef.current.push(...accepted);
    startNextUpload();
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const dismissPendingFile = (index: number) => {
    setPendingFiles((prev) => {
      const dismissed = prev[index];
      if (!dismissed) return prev;
      if (dismissed.state === 'uploading') {
        if (activeUploadRef.current === dismissed.file) {
          cancelledUploadsRef.current.add(dismissed.file);
        } else {
          uploadQueueRef.current = uploadQueueRef.current.filter(
            (file) => file !== dismissed.file,
          );
        }
      }
      revokePreviewUrl(dismissed.preview);
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  return {
    attachments,
    pendingFiles,
    isUploading: pendingFiles.some((file) => file.state === 'uploading'),
    handleFileChange,
    removeAttachment,
    dismissPendingFile,
    clearAttachments: () => setAttachments([]),
  };
};
