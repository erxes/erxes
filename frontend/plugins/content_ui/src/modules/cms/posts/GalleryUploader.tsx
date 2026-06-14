import { Button, useErxesUpload } from 'erxes-ui';
import { IconGripVertical, IconUpload, IconX } from '@tabler/icons-react';
import { readImage } from 'erxes-ui/utils/core';
import { DragEvent, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAutoUpload } from './hooks/useAutoUpload';

interface GalleryUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

const MAX_GALLERY_IMAGES = 100;
const MAX_GALLERY_IMAGE_SIZE = 20 * 1024 * 1024;

type UploadedFile = {
  url: string;
};

export const GalleryUploader = ({
  value = [],
  onChange,
  maxImages = MAX_GALLERY_IMAGES,
}: GalleryUploaderProps) => {
  const urls = useMemo(
    () => Array.from(new Set(value.filter(Boolean))),
    [value],
  );
  const urlsRef = useRef(urls);

  const handleFilesAdded = useCallback(
    (addedFiles: UploadedFile[]) => {
      const addedUrls = addedFiles.map((file) => file.url).filter(Boolean);
      const next = Array.from(
        new Set([...urlsRef.current, ...addedUrls]),
      ).slice(0, maxImages);
      onChange(next);
    },
    [maxImages, onChange],
  );

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: maxImages,
    maxFileSize: MAX_GALLERY_IMAGE_SIZE,
    onFilesAdded: handleFilesAdded,
  });

  useEffect(() => {
    urlsRef.current = urls;
  }, [urls]);
  useAutoUpload(uploadProps);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(urls.filter((_, currentIndex) => currentIndex !== index));
    },
    [onChange, urls],
  );

  /** Stores the dragged image position for native drop handling. */
  function handleDragStart(event: DragEvent<HTMLDivElement>, index: number) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }

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

  const pendingFiles = uploadProps.files.filter(
    (file) => !uploadProps.successes.includes(file.name),
  );

  return (
    <div className="space-y-2">
      {(urls.length > 0 || pendingFiles.length > 0) && (
        <div className="relative">
          <div className="flex flex-wrap gap-4">
            {urls.map((url, index) => (
              <div
                key={url}
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDrop={(event) => handleDrop(event, index)}
                onDragOver={(event) => event.preventDefault()}
                className="aspect-square w-24 rounded-md overflow-hidden shadow-xs relative border bg-muted cursor-move group"
              >
                <div
                  role="img"
                  aria-label={`Gallery ${index + 1}`}
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${readImage(url)})` }}
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
            {pendingFiles.map((file) => (
              <div
                key={[file.name, file.size, file.type, file.lastModified].join(
                  ':',
                )}
                className="aspect-square w-24 rounded-md overflow-hidden shadow-xs relative border bg-muted"
              >
                {file.preview && (
                  <div
                    role="img"
                    aria-label={file.name}
                    className="w-full h-full bg-cover bg-center opacity-70"
                    style={{ backgroundImage: `url(${file.preview})` }}
                  />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 px-2 text-center text-xs text-muted-foreground">
                  {uploadProps.loading ? 'Uploading...' : 'Ready'}
                </div>
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
        {Boolean(uploadProps.errors.length) && (
          <p className="text-xs text-destructive mt-1">
            {uploadProps.errors[0]?.message || 'Upload failed'}
          </p>
        )}
      </div>
    </div>
  );
};
