import {
  IconCloudUpload,
  IconLoader2,
  IconPlus,
  IconUpload,
} from '@tabler/icons-react';
import { FileGrid } from '@/automations/components/settings/components/agents/components/FilesList';
import { TAiAgentContextFile } from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Button, cn, toast, useUpload } from 'erxes-ui';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';

type UploadedContextFile = {
  key: string;
  name: string;
  size?: number;
  type?: string;
  uploadedAt?: Date;
};

interface UploadDropzoneProps {
  files: TAiAgentContextFile[];
  maxFiles: number;
  maxSingleFileBytes: number;
  maxTotalContextBytes: number;
  onFilesUploaded: (file: UploadedContextFile[]) => void;
  onFileDelete: (fileId: string) => void;
  onFileClick?: (fileId: string) => void;
}

const ACCEPTED_FORMATS = ['.md', '.markdown', '.txt'] as const;

const formatBytes = (bytes: number) => {
  if (bytes >= 1000) {
    return `${Math.round(bytes / 1000)} KB`;
  }

  return `${bytes} B`;
};

export function UploadDropzone({
  files,
  maxFiles,
  maxSingleFileBytes,
  maxTotalContextBytes,
  onFilesUploaded,
  onFileDelete,
  onFileClick,
}: UploadDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const { isLoading, upload } = useUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const totalBytes = files.reduce(
    (sum, currentFile) => sum + (currentFile.size || 0),
    0,
  );
  const usagePercent = Math.min((totalBytes / maxTotalContextBytes) * 100, 100);
  const canAddMore =
    files.length < maxFiles && totalBytes < maxTotalContextBytes;

  const openFilePicker = useCallback(() => {
    if (!canAddMore || isLoading) {
      return;
    }

    inputRef.current?.click();
  }, [canAddMore, isLoading]);

  const validateFiles = useCallback(
    (selectedFiles: File[]) => {
      const uploaded: File[] = [];

      for (const file of selectedFiles) {
        const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;

        if (
          !ACCEPTED_FORMATS.includes(
            extension as (typeof ACCEPTED_FORMATS)[number],
          )
        ) {
          toast({
            title: 'Unsupported file format',
            description: `"${file.name}" must be MD, MARKDOWN, or TXT.`,
            variant: 'destructive',
          });
          return null;
        }

        if (file.size > maxSingleFileBytes) {
          toast({
            title: 'Context file is too large',
            description: `"${file.name}" exceeds ${formatBytes(maxSingleFileBytes)}.`,
            variant: 'destructive',
          });
          return null;
        }

        if (files.length + uploaded.length >= maxFiles) {
          toast({
            title: 'Too many context files',
            description: `You can attach up to ${maxFiles} files.`,
            variant: 'destructive',
          });
          return null;
        }

        const nextTotalBytes =
          totalBytes +
          uploaded.reduce((sum, currentFile) => sum + currentFile.size, 0) +
          file.size;

        if (nextTotalBytes > maxTotalContextBytes) {
          toast({
            title: 'Combined context is too large',
            description: `Keep total context under ${formatBytes(maxTotalContextBytes)}.`,
            variant: 'destructive',
          });
          return null;
        }

        uploaded.push(file);
      }

      return uploaded;
    },
    [
      files.length,
      maxFiles,
      maxSingleFileBytes,
      maxTotalContextBytes,
      totalBytes,
    ],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onUploadFiles = useCallback(
    (fileList: FileList) => {
      const validFiles = validateFiles(Array.from(fileList));
      const uploaded: UploadedContextFile[] = [];

      if (validFiles && validFiles.length > 0) {
        let remaining = validFiles.length;
        const dataTransfer = new DataTransfer();

        validFiles.forEach((file) => dataTransfer.items.add(file));

        upload({
          files: dataTransfer.files,
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
    },
    [onFilesUploaded, upload, validateFiles],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!canAddMore || isLoading) {
      return;
    }

    onUploadFiles(e.dataTransfer.files);
  }, [canAddMore, isLoading, onUploadFiles]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;

      if (fileList && fileList.length > 0) {
        onUploadFiles(fileList);
      }

      e.target.value = '';
    },
    [onUploadFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'rounded-xl border-2 border-dashed transition-colors duration-200',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-border/80 bg-background/60',
        canAddMore && !isLoading && 'cursor-pointer hover:border-muted-foreground/50',
        (!canAddMore || isLoading) && 'cursor-default',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFilePicker}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && canAddMore && !isLoading) {
          e.preventDefault();
          openFilePicker();
        }
      }}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".md,.markdown,.txt,text/markdown,text/plain"
        disabled={!canAddMore || isLoading}
      />

      {files.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-muted">
            {isLoading ? (
              <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <IconCloudUpload className="size-6 text-muted-foreground" />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Upload Context Files</h3>
            <p className="text-sm text-muted-foreground">
              Drag markdown or text files here, or click to browse
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              openFilePicker();
            }}
            disabled={!canAddMore || isLoading}
          >
            {isLoading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconPlus className="size-4" />
            )}
            {isLoading ? 'Uploading...' : 'Choose Files'}
          </Button>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Supported formats: MD, MARKDOWN, TXT
          </p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <FileGrid
            files={files}
            onFileDelete={(fileId) => {
              onFileDelete(fileId);
            }}
            onFileClick={onFileClick}
          />

          {canAddMore && (
            <div
              className={cn(
                'flex items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-4 text-sm text-muted-foreground transition-colors',
                isDragOver
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-muted-foreground/25 bg-muted/30',
              )}
            >
              {isLoading ? (
                <IconLoader2 className="size-4 animate-spin" />
              ) : (
                <IconUpload className="size-4" />
              )}
                <span>
                  {isLoading
                    ? 'Uploading files...'
                    : 'Drop more files or click to add'}
                </span>
            </div>
          )}

          <div className="space-y-2 border-t border-border/70 pt-3">
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                {files.length} / {maxFiles} files
              </span>
              <span>
                {formatBytes(totalBytes)} / {formatBytes(maxTotalContextBytes)} used
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
