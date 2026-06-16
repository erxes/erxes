import { Button, useErxesUpload } from 'erxes-ui';
import { IconX, IconPaperclip, IconPhotoPlus } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { MediaPickerDialog, MediaSelection } from '../media/MediaPicker';

interface AttachmentsUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
}

export const AttachmentsUploader = ({
  value = [],
  onChange,
}: AttachmentsUploaderProps) => {
  const urls = value || [];
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: [],
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    uploadKind: 'media',
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
        <div className="relative space-y-1">
          {urls.map((url) => (
            <div
              key={url}
              className="flex items-center gap-2 border rounded p-2 bg-muted"
            >
              <IconPaperclip size={16} className="text-muted-foreground" />
              <span className="text-sm flex-1 truncate">{url}</span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={() => handleRemove(url)}
              >
                <IconX size={16} />
              </Button>
            </div>
          ))}
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
            {uploadProps.loading ? 'Uploading...' : 'Upload Attachments'}
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
        multiple
        onSelect={(selection) => {
          const selected = selection as MediaSelection[];
          const next = [...urls, ...selected.map((media) => media.url)].slice(
            0,
            10,
          );

          onChange(Array.from(new Set(next)));
        }}
      />
    </div>
  );
};
