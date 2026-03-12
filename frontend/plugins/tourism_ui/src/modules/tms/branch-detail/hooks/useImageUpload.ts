import { useEffect, useRef } from 'react';
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
  const processedRef = useRef<string[]>([]);

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

      const newUrls = uploadedUrls.filter(
        (url) => !processedRef.current.includes(url),
      );

      if (!newUrls.length) return;

      processedRef.current.push(...newUrls);

      const merged = [...existing, ...newUrls];
      const unique = Array.from(new Set(merged));

      onChange(unique.slice(0, maxImages));
    },
  });

  const { files, loading, onUpload } = uploadProps;

  useEffect(() => {
    if (!files?.length) return;

    void onUpload();
  }, [files, onUpload]);

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
