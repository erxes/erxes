import { Button, useErxesUpload } from 'erxes-ui';
import { IconX, IconHeadphones } from '@tabler/icons-react';
import { useEffect } from 'react';

interface AudioUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
}

export const AudioUploader = ({ value, onChange }: AudioUploaderProps) => {
  const uploadProps = useErxesUpload({
    allowedMimeTypes: ['audio/*'],
    maxFiles: 1,
    maxFileSize: 50 * 1024 * 1024, // 50MB
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
          <div className="border rounded p-4 bg-muted">
            <div className="flex items-center gap-3 mb-3">
              <IconHeadphones size={24} className="text-muted-foreground" />
              <span className="text-sm font-medium flex-1 truncate">
                {value}
              </span>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={handleRemove}
              >
                <IconX size={16} />
              </Button>
            </div>
            <audio src={value} controls className="w-full" />
          </div>
          {uploadProps.loading && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded">
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
            {uploadProps.loading ? 'Uploading...' : 'Upload Audio'}
          </Button>
        </div>
      )}
    </div>
  );
};
