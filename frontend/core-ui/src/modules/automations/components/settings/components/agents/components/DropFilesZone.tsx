import { IconPlus } from '@tabler/icons-react';
import { Card, cn, useUpload } from 'erxes-ui';
import type React from 'react';
import { useCallback, useId, useState } from 'react';

type FileUploadType = {
  key: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
};

interface UploadDropzoneProps {
  onFilesUploaded: (file: FileUploadType[]) => void;
}

export function UploadDropzone({ onFilesUploaded }: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { upload } = useUpload();
  const inputId = useId();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onUploadFiles = (files: FileList) => {
    const uploaded: FileUploadType[] = [];

    if (files && files.length > 0) {
      let remaining = files.length;

      upload({
        files,
        afterUpload: ({ fileInfo, response }) => {
          const { name, size, type } = fileInfo;

          uploaded.push({
            name,
            size,
            key: response,
            type,
            uploadedAt: new Date(),
          });

          remaining -= 1;
          if (remaining === 0) {
            onFilesUploaded(uploaded);
          }
        },
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    onUploadFiles(e.dataTransfer.files);
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;

      if (fileList && fileList.length > 0) {
        onUploadFiles(fileList);
      }
    },
    [],
  );

  return (
    <Card
      className={cn(
        'cursor-pointer border-2 border-dashed transition-colors duration-200',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium">Upload Context Files</h3>
        <p className="mb-4 text-muted-foreground">
          Drag markdown or text files here, or click to browse
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id={inputId}
          accept=".md,.markdown,.txt,text/markdown,text/plain"
        />
        <label
          htmlFor={inputId}
          className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <IconPlus />
          Choose Files
        </label>
        <p className="mt-2 text-xs text-muted-foreground">
          Supported formats: MD, MARKDOWN, TXT
        </p>
      </div>
    </Card>
  );
}
