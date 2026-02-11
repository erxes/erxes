import { IconX } from '@tabler/icons-react';
import {
  Button,
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
  formatBytes,
  getFileIcon,
  readImage,
  useErxesUpload,
  useRemoveFile,
} from 'erxes-ui';
import { useState } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

export const BroadcastAttachment = ({
  value,
  onChange,
}: ControllerRenderProps<FieldValues, 'email.attachments'>) => {
  const [files, setFiles] = useState<any[]>(value || []);
  const { removeFile, isLoading } = useRemoveFile();

  const props = useErxesUpload({
    maxFiles: 10,
    maxFileSize: 20 * 1024 * 1024,
    onFilesAdded: (addedFiles) => {
      const newFiles = [
        ...files.filter(
          (file) => !addedFiles.some((f) => f.name === file.name),
        ),
        ...addedFiles.map((file) => ({
          name: file.name,
          url: file.url,
          type: file.type,
          size: file.size,
        })),
      ];

      setFiles(newFiles);
      onChange(newFiles);
    },
  });

  return (
    <div className="h-full overflow-y-auto space-y-2 rounded">
      {files.map((attachment) => (
        <div
          key={attachment.url}
          className="relative w-full h-12 rounded border bg-muted overflow-hidden flex items-center gap-2"
        >
          {attachment.type.startsWith('image/') ? (
            <div className="h-12 w-12 rounded border overflow-hidden shrink-0 bg-muted flex items-center justify-center">
              <img
                src={readImage(attachment.url)}
                alt={attachment.name}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-12 w-12 shrink-0 rounded border bg-white flex items-center justify-center">
              {getFileIcon(attachment.type, attachment.name)}
            </div>
          )}

          <div className="shrink grow flex flex-col items-start truncate">
            <p title={attachment.name} className="text-sm truncate max-w-full">
              {attachment.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatBytes(attachment.size, 2)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-full w-12 shrink-0"
            disabled={isLoading}
            onClick={() =>
              removeFile(attachment.name, (status) => {
                if (status === 'ok') {
                  setFiles(files.filter((f) => f.name !== attachment.name));
                }
              })
            }
          >
            <IconX size={10} />
          </Button>
        </div>
      ))}
      <Dropzone {...props} className="mb-30">
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
};
