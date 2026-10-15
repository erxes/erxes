import { useAiAgentContextFileEditor } from '@/automations/components/settings/components/agents/hooks/useAiAgentContextFileEditor';
import {
  formatContextFileSize,
  formatContextFileUploadedAt,
  getContextFileExtension,
  TAiAgentContextFile,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { IconClock, IconLoader2 } from '@tabler/icons-react';
import { useState } from 'react';
import { Badge, Button, cn, Input, ScrollArea, Textarea } from 'erxes-ui';

export const AiAgentContextFileEditor = ({
  file,
  onSave,
}: {
  file: TAiAgentContextFile;
  onSave: (file: TAiAgentContextFile) => void;
}) => {
  const editor = useAiAgentContextFileEditor({ file, onSave });
  const [showVersions, setShowVersions] = useState(false);
  const sources = [file, ...(file.versions || [])];

  return (
    <div
      className={cn(
        'grid h-full min-h-0 gap-4',
        showVersions &&
          'grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_240px] lg:grid-rows-1',
      )}
    >
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Input
            value={editor.name}
            onChange={(event) => editor.setName(event.target.value)}
            placeholder="context-file"
            disabled={editor.isSaving}
          />
          <span className="shrink-0 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
            {getContextFileExtension(file.name) || '.md'}
          </span>
          <Button
            variant={showVersions ? 'secondary' : 'outline'}
            className="shrink-0"
            onClick={() => setShowVersions((current) => !current)}
            aria-pressed={showVersions}
          >
            <IconClock className="size-4" />
            Versions
            <Badge variant="secondary">{sources.length}</Badge>
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
          {editor.isLoading ? (
            <div className="flex h-full min-h-60 items-center justify-center text-sm text-muted-foreground">
              <IconLoader2 className="mr-2 size-4 animate-spin" />
              Loading file…
            </div>
          ) : (
            <Textarea
              value={editor.content}
              onChange={(event) => editor.setContent(event.target.value)}
              className="h-full min-h-60 resize-none border-0 p-4 font-mono text-sm shadow-none focus-visible:ring-0"
              placeholder="Write markdown context here…"
              disabled={editor.isSaving}
            />
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {editor.isDirty
              ? 'Unsaved changes'
              : `${editor.content.length} chars`}
          </span>
          <Button
            onClick={() => void editor.save()}
            disabled={!editor.isDirty || editor.isSaving || editor.isLoading}
          >
            {editor.isSaving && <IconLoader2 className="size-4 animate-spin" />}
            Save file
          </Button>
        </div>
      </div>

      {showVersions && (
        <ScrollArea className="max-h-48 min-h-0 lg:max-h-none">
          <div className="grid gap-2">
            {sources.map((source, index) => (
              <button
                type="button"
                key={`${source.key}-${source.uploadedAt || index}`}
                onClick={() => void editor.loadSource(source)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  editor.loadedKey === source.key
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent/40',
                )}
              >
                <div className="truncate font-medium">
                  {index === 0 ? 'Current' : source.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatContextFileSize(source.size)}
                  {formatContextFileUploadedAt(source.uploadedAt) &&
                    ` · ${formatContextFileUploadedAt(source.uploadedAt)}`}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
