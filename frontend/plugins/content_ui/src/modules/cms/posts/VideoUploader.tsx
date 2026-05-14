import { Button, useErxesUpload } from 'erxes-ui';
import { IconX } from '@tabler/icons-react';
import { useEffect } from 'react';

interface VideoUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export const VideoUploader = ({ value, onChange }: VideoUploaderProps) => {
  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['video/*'],
    maxFiles: 1,
    maxFileSize: 100 * 1024 * 1024,
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
  }, [uploadProps]);

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
          <Button
            variant="outline"
            className="w-full"
            onClick={uploadProps.open}
            disabled={uploadProps.loading}
            type="button"
          >
            {uploadProps.loading ? 'Uploading...' : 'Upload Video'}
          </Button>
        </div>
      )}
    </div>
  );
};
