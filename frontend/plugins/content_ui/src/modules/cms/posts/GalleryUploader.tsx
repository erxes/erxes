import { Button, useErxesUpload } from 'erxes-ui';
import { IconGripVertical, IconUpload, IconX } from '@tabler/icons-react';
import { readImage } from 'erxes-ui/utils/core';
import { DragEvent, useCallback, useEffect, useMemo, useRef } from 'react';

interface GalleryUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

const MAX_GALLERY_IMAGES = 100;

export const GalleryUploader = ({
  value = [],
  onChange,
  maxImages = MAX_GALLERY_IMAGES,
}: GalleryUploaderProps) => {
  const urls = useMemo(() => value.filter(Boolean), [value]);
  const urlsRef = useRef(urls);
  const uploadedBatchRef = useRef<string | null>(null);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: maxImages,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      const addedUrls = addedFiles.map((file) => file.url).filter(Boolean);
      const next = [...urlsRef.current, ...addedUrls].slice(0, maxImages);
      onChange(next);
    },
  });

  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);

  const fileBatchKey = useMemo(() => {
    if (!uploadProps.files.length) {
      return '';
    }

    return uploadProps.files
      .map((file) =>
        [
          file.name ?? '',
          file.size ?? '',
          file.type ?? '',
          file.lastModified ?? '',
        ].join(':'),
      )
      .join('|');
  }, [uploadProps.files]);

  useEffect(() => {
    if (!uploadProps.files.length) {
      uploadedBatchRef.current = null;
      return;
    }

    if (
      !fileBatchKey ||
      uploadedBatchRef.current === fileBatchKey ||
      uploadProps.loading
    ) {
      return;
    }

    uploadedBatchRef.current = fileBatchKey;
    void uploadProps.onUpload();
  }, [fileBatchKey, uploadProps]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(urls.filter((_, currentIndex) => currentIndex !== index));
    },
    [onChange, urls],
  );

  const handleDragStart = (event: DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  };

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>, toIndex: number) => {
      event.preventDefault();

      const fromIndex = Number(event.dataTransfer.getData('text/plain'));

      if (
        Number.isNaN(fromIndex) ||
        fromIndex === toIndex ||
        fromIndex < 0 ||
        fromIndex >= urls.length
      ) {
        return;
      }

      const next = [...urls];
      const [movedUrl] = next.splice(fromIndex, 1);

      if (!movedUrl) {
        return;
      }

      next.splice(toIndex, 0, movedUrl);
      onChange(next);
    },
    [onChange, urls],
  );

  return (
    <div className="space-y-2">
      {urls.length > 0 && (
        <div className="relative">
          <div className="flex flex-wrap gap-4">
            {urls.map((url, index) => (
              <div
                key={`${url}-${index}`}
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDrop={(event) => handleDrop(event, index)}
                onDragOver={(event) => event.preventDefault()}
                className="aspect-square w-24 rounded-md overflow-hidden shadow-xs relative border bg-muted cursor-move group"
              >
                <img
                  src={readImage(url)}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1 left-1 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
                  <IconGripVertical size={12} />
                  {index + 1}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
                  type="button"
                  aria-label={`Remove gallery image ${index + 1}`}
                  onClick={() => handleRemove(index)}
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
          disabled={uploadProps.loading || urls.length >= maxImages}
          type="button"
        >
          {uploadProps.loading ? (
            'Uploading...'
          ) : (
            <>
              <IconUpload size={16} className="mr-2" />
              Add Images
            </>
          )}
        </Button>
        {urls.length >= maxImages && (
          <p className="text-xs text-muted-foreground mt-1">
            Maximum {maxImages} images allowed
          </p>
        )}
      </div>
    </div>
  );
};
