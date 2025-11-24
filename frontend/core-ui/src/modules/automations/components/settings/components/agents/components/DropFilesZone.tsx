import { IconPlus } from '@tabler/icons-react';
import { Card, cn, useUpload } from 'erxes-ui';
import type React from 'react';

import { useState, useCallback } from 'react';

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
  const { isLoading, upload } = useUpload();

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
          // onFilesUploaded({ name, size, type });
          uploaded.push({
            name,
            size,
            key: response,
            type,
            uploadedAt: new Date(),
          });

          remaining -= 1;
          if (remaining === 0) {
            // all done
            onFilesUploaded(uploaded);
          }
        },
      });
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      onUploadFiles(e.dataTransfer.files);
    },
    [upload],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList && fileList.length > 0) {
        onUploadFiles(fileList);
      }
    },
    [onFilesUploaded],
  );

  return (
    <Card
      className={cn(
        'border-2 border-dashed transition-colors duration-200 cursor-pointer',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-muted-foreground/50',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="p-12 text-center">
        <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
          <svg
            className="w-8 h-8 text-muted-foreground"
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
        <h3 className="text-lg font-medium mb-2">Upload Training Files</h3>
        <p className="text-muted-foreground mb-4">
          Drag and drop your files here, or click to browse
        </p>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept=".txt,.pdf,.doc,.docx,.json,.csv"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
        >
          <IconPlus />
          Choose Files
        </label>
        <p className="text-xs text-muted-foreground mt-2">
          Supported formats: TXT, PDF, DOC, DOCX, JSON, CSV
        </p>
      </div>
    </Card>
  );
}
