import { useEffect, useMemo, useRef } from 'react';
import { useErxesUpload } from 'erxes-ui';

interface UseImageUploadProps {
  value?: string[];
  onChange: (value: string[]) => void;
  maxImages?: number;
  maxFileSize?: number;
}

export const useImageUpload = ({
  value = [],
  onChange,
  maxImages = 10,
  maxFileSize = 20 * 1024 * 1024,
}: UseImageUploadProps) => {
  const urls = value ?? [];
  const processedRef = useRef<Set<string>>(new Set());
  const uploadedBatchRef = useRef<string | null>(null);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: maxImages,
    maxFileSize,
    onFilesAdded: (uploadedFiles) => {
      const existing = value ?? [];

      const uploadedUrls = (uploadedFiles ?? [])
        .map((file) => file?.url)
        .filter((url): url is string => Boolean(url));

      if (!uploadedUrls.length) return;

      const uniqueUploadedUrls = Array.from(new Set(uploadedUrls));

      const newUrls = uniqueUploadedUrls.filter(
        (url) => !existing.includes(url) && !processedRef.current.has(url),
      );

      if (!newUrls.length) return;

      newUrls.forEach((url) => processedRef.current.add(url));

      const merged = [...existing, ...newUrls];
      const unique = Array.from(new Set(merged));

      onChange(unique.slice(0, maxImages));
    },
  });

  const { files, loading, onUpload } = uploadProps;
  const fileBatchKey = useMemo(() => {
    if (!files?.length) {
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
  }, [files]);

  useEffect(() => {
    if (!files?.length) {
      uploadedBatchRef.current = null;
      return;
    }

    if (!fileBatchKey || uploadedBatchRef.current === fileBatchKey) {
      return;
    }

    uploadedBatchRef.current = fileBatchKey;
    void onUpload();
  }, [fileBatchKey, files, onUpload]);

  const handleRemove = (url: string) => {
    onChange(urls.filter((u) => u !== url));
  };

  const handleDrag = (from: number, to: number) => {
    if (from === to) return;

    const updated = [...urls];
    const item = updated.splice(from, 1)[0];

    updated.splice(to, 0, item);

    onChange(updated);
  };

  return {
    urls,
    uploadProps,
    loading,
    handleRemove,
    handleDrag,
  };
};
