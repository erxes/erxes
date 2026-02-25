import { Button, useErxesUpload } from 'erxes-ui';
import { IconX, IconPaperclip } from '@tabler/icons-react';
import { useEffect } from 'react';

interface AttachmentsUploaderProps {
  value?: string[];
  onChange: (urls: string[]) => void;
}

export const AttachmentsUploader = ({
  value = [],
  onChange,
}: AttachmentsUploaderProps) => {
  const urls = value || [];

  const uploadProps = useErxesUpload({
    allowedMimeTypes: [], // Allow all file types
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024, // 20MB
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
        <Button
          variant="outline"
          className="w-full"
          onClick={uploadProps.open}
          disabled={uploadProps.loading}
          type="button"
        >
          {uploadProps.loading ? 'Uploading...' : 'Upload Attachments'}
        </Button>
      </div>
    </div>
  );
};
