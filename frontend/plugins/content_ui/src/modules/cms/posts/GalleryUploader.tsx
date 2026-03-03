import { Button, useErxesUpload } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { readImage } from 'erxes-ui/utils/core';
import { useEffect } from 'react';

interface GalleryUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
}

export const GalleryUploader = ({
  value = [],
  onChange,
}: GalleryUploaderProps) => {
  const urls = value || [];

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      const existing = urls || [];
      const addedUrls = (addedFiles || [])
        .map((file: any) => file.url)
        .filter(Boolean);
      const next = [...existing, ...addedUrls].slice(0, 10);
      onChange(next);
    },
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload();
    }
  }, [uploadProps.files.length]);

  const handleRemove = (url: string) => {
    const next = (urls || []).filter((u) => u !== url);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="relative">
          <div className="flex flex-wrap gap-4">
            {urls.map((url) => (
              <div
                key={url}
                className="aspect-square w-24 rounded-md overflow-hidden shadow-xs relative border bg-muted"
              >
                <img
                  src={readImage(url)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0"
                  type="button"
                  onClick={() => handleRemove(url)}
                >
                  <IconX size={12} />
                </Button>
              </div>
            ))}
          </div>
          {uploadProps.loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="text-sm text-gray-500">Uploading...</div>
            </div>
          )}
        </div>
      )}
      <div>
        <input {...uploadProps.getInputProps()} />
        <Button
          variant="outline"
          className="w-full"
          onClick={uploadProps.open}
          disabled={uploadProps.loading}
          type="button"
        >
          {uploadProps.loading ? 'Uploading...' : 'Add Images'}
        </Button>
      </div>
    </div>
  );
};
