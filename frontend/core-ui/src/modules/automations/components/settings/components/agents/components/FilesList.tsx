import {
  IconFileText,
  IconHistory,
  IconMarkdown,
  IconRefresh,
  IconTrash,
  IconTxt,
} from '@tabler/icons-react';
import {
  formatContextFileSize,
  formatContextFileUploadedAt,
  getContextFileVersionCount,
  TAiAgentContextFile,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Badge, Button, cn, Tooltip } from 'erxes-ui';

interface FileGridProps {
  files: TAiAgentContextFile[];
  onFileDelete: (fileId: string) => void;
  onFileClick?: (fileId: string) => void;
  onFileReindex?: (fileId: string) => void;
  reindexingFileId?: string | null;
}

export function FileGrid({
  files = [],
  onFileDelete,
  onFileClick,
  onFileReindex,
  reindexingFileId,
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

  const getStatusVariant = (status?: TAiAgentContextFile['status']) => {
    if (status === 'indexed') {
      return 'success';
    }

    if (status === 'failed') {
      return 'destructive';
    }

    if (status === 'indexing') {
      return 'warning';
    }

    return 'secondary';
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
            onFileClick &&
              'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
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
                  {typeof file.chunkCount === 'number' && (
                    <span>{file.chunkCount} chunks</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant={getStatusVariant(file.status)}
                    className="w-fit"
                  >
                    {file.status || 'uploaded'}
                  </Badge>
                  {file.purpose && (
                    <Badge variant="secondary" className="w-fit">
                      {file.purpose}
                    </Badge>
                  )}
                </div>
                {file.indexError && (
                  <p
                    className="line-clamp-2 text-xs text-destructive"
                    title={file.indexError}
                  >
                    {file.indexError}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {onFileReindex && (
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFileReindex(file.id);
                      }}
                      className="h-7 w-7 p-0 text-muted-foreground"
                      aria-label={`Reindex ${file.name}`}
                      disabled={reindexingFileId === file.id}
                    >
                      <IconRefresh
                        className={cn(
                          'size-4',
                          reindexingFileId === file.id && 'animate-spin',
                        )}
                      />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Reindex knowledge</Tooltip.Content>
                </Tooltip>
              )}
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
        </div>
      ))}
    </div>
  );
}
