import { Button, useErxesUpload } from 'erxes-ui';
import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { readImage } from 'erxes-ui/utils/core';
import { useEffect, useState } from 'react';
import { MediaPickerDialog, MediaSelection } from '../media/MediaPicker';

interface GalleryUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
}

const MAX_GALLERY_IMAGES = 100;

export const GalleryUploader = ({
  value = [],
  onChange,
}: GalleryUploaderProps) => {
  const urls = value || [];
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['image/*'],
    maxFiles: MAX_GALLERY_IMAGES,
    maxFileSize: 20 * 1024 * 1024,
    uploadKind: 'media',
    onFilesAdded: (addedFiles) => {
      const existing = urls || [];
      const addedUrls = (addedFiles || [])
        .map((file: any) => file.url)
        .filter(Boolean);
      const next = [...existing, ...addedUrls].slice(0, MAX_GALLERY_IMAGES);
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
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={uploadProps.open}
            disabled={uploadProps.loading}
            type="button"
          >
            {uploadProps.loading ? 'Uploading...' : 'Add Images'}
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => setMediaPickerOpen(true)}
            type="button"
          >
            <IconPhotoPlus size={16} />
            Media library
          </Button>
        </div>
      </div>
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        fileType="image"
        multiple
        onSelect={(selection) => {
          const selected = selection as MediaSelection[];
          const next = [...urls, ...selected.map((media) => media.url)].slice(
            0,
            MAX_GALLERY_IMAGES,
          );

          onChange(Array.from(new Set(next)));
        }}
      />
    </div>
  );
};
