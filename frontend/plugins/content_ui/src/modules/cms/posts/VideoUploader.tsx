import { Button, useErxesUpload } from 'erxes-ui';
import { IconPhotoPlus, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { MediaPickerDialog, MediaSelection } from '../media/MediaPicker';

interface VideoUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export const VideoUploader = ({ value, onChange }: VideoUploaderProps) => {
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['video/*'],
    maxFiles: 1,
    maxFileSize: 100 * 1024 * 1024,
    uploadKind: 'media',
    onFilesAdded: (addedFiles) => {
      const url = addedFiles?.[0]?.url;
      if (url) {
        onChange(url);
      }
    },
  });

  useEffect(() => {
    if (uploadProps.files.length > 0 && !uploadProps.loading) {
      uploadProps.onUpload();
    }
  }, [uploadProps.files.length]);

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-2">
      {value && (
        <div className="relative">
          <div className="relative border rounded overflow-hidden bg-black">
            <video
              src={value}
              controls
              className="w-full h-64 object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              type="button"
              onClick={handleRemove}
            >
              <IconX size={16} />
            </Button>
          </div>
          {uploadProps.loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
              <div className="text-sm text-gray-500">Uploading...</div>
            </div>
          )}
        </div>
      )}
      {!value && (
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
              {uploadProps.loading ? 'Uploading...' : 'Upload Video'}
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
      )}
      <MediaPickerDialog
        open={mediaPickerOpen}
        onOpenChange={setMediaPickerOpen}
        fileType="video"
        onSelect={(selection) => onChange((selection as MediaSelection).url)}
      />
    </div>
  );
};
