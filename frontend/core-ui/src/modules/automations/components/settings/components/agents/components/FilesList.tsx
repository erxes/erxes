import {
  IconFileText,
  IconHistory,
  IconMarkdown,
  IconTrash,
  IconTxt,
} from '@tabler/icons-react';
import {
  formatContextFileSize,
  formatContextFileUploadedAt,
  getContextFileVersionCount,
  TAiAgentContextFile,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Button, cn } from 'erxes-ui';

interface FileGridProps {
  files: TAiAgentContextFile[];
  onFileDelete: (fileId: string) => void;
  onFileClick?: (fileId: string) => void;
}

export function FileGrid({
  files = [],
  onFileDelete,
  onFileClick,
}: FileGridProps) {
  const getFileIcon = (file: TAiAgentContextFile) => {
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

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {files.map((file) => (
        <div
          key={file.id}
          role={onFileClick ? 'button' : undefined}
          tabIndex={onFileClick ? 0 : undefined}
          onClick={(event) => {
            if (!onFileClick) {
              return;
            }

            event.stopPropagation();
            onFileClick(file.id);
          }}
          onKeyDown={(event) => {
            if (!onFileClick) {
              return;
            }

            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              onFileClick(file.id);
            }
          }}
          className={cn(
            'rounded-xl border bg-background/95 px-4 py-3 shadow-xs transition-colors',
            'hover:border-border hover:bg-accent/20',
            onFileClick && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
                  <span>{formatContextFileSize(file.size)}</span>
                  {formatContextFileUploadedAt(file.uploadedAt) && (
                    <span>
                      Added {formatContextFileUploadedAt(file.uploadedAt)}
                    </span>
                  )}
                  {getContextFileVersionCount(file) > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <IconHistory className="size-3.5" />
                      {getContextFileVersionCount(file)} previous
                    </span>
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
