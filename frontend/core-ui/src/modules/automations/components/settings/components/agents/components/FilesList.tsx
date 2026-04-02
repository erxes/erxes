import {
  IconFileText,
  IconMarkdown,
  IconTrash,
  IconTxt,
} from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';

interface UploadedFile {
  id: string;
  name: string;
  size?: number;
  type?: string;
  uploadedAt?: string;
}

interface FileGridProps {
  files: UploadedFile[];
  onFileDelete: (fileId: string) => void;
}

export function FileGrid({ files = [], onFileDelete }: FileGridProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    );
  };

  const getFileIcon = (file: UploadedFile) => {
    const name = file.name.toLowerCase();
    const type = file.type || '';

    if (name.endsWith('.md') || name.endsWith('.markdown')) {
      return <IconMarkdown className="size-5 text-primary" />;
    }

    if (type.includes('text') || name.endsWith('.txt')) {
      return <IconTxt className="size-5 text-info" />;
    }

    return <IconFileText className="size-5 text-muted-foreground" />;
  };

  const formatUploadedAt = (uploadedAt?: string) => {
    if (!uploadedAt) {
      return null;
    }

    const parsed = new Date(uploadedAt);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toLocaleDateString();
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {files.map((file) => (
        <div
          key={file.id}
          className={cn(
            'rounded-xl border bg-background/95 px-4 py-3 shadow-xs transition-colors',
            'hover:border-border hover:bg-accent/20',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/70">
                {getFileIcon(file)}
              </div>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-medium" title={file.name}>
                  {file.name}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.size || 0)}</span>
                  {formatUploadedAt(file.uploadedAt) && (
                    <span>Added {formatUploadedAt(file.uploadedAt)}</span>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onFileDelete(file.id);
              }}
              className="h-7 w-7 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label={`Remove ${file.name}`}
            >
              <IconTrash className="size-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
