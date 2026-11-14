import {
  IconCloudUpload,
  IconLoader2,
  IconPlus,
  IconUpload,
} from '@tabler/icons-react';
import { FileGrid } from '@/automations/components/settings/components/agents/components/FilesList';
import {
  TUploadedContextFile,
  useUploadDropzone,
} from '@/automations/components/settings/components/agents/hooks/useUploadDropzone';
import { CONTEXT_FILE_ACCEPT } from '@/automations/components/settings/components/agents/utils/contextFileUpload';
import { TAiAgentContextFile } from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Button, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface UploadDropzoneProps {
  files: TAiAgentContextFile[];
  maxFiles: number;
  maxSingleFileBytes: number;
  maxTotalContextBytes: number;
  onFilesUploaded: (file: TUploadedContextFile[]) => void;
  onFileDelete: (fileId: string) => void;
  onFileClick?: (fileId: string) => void;
  onFileReindex?: (fileId: string) => void;
  reindexingFileId?: string | null;
}

export function UploadDropzone({
  files,
  maxFiles,
  maxSingleFileBytes,
  maxTotalContextBytes,
  onFilesUploaded,
  onFileDelete,
  onFileClick,
  onFileReindex,
  reindexingFileId,
}: UploadDropzoneProps) {
  const { t } = useTranslation('automations');
  const {
    inputRef,
    isDragOver,
    isLoading,
    canAddMore,
    isDisabled,
    usageStyle,
    usedLabel,
    totalLabel,
    openFilePicker,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleKeyDown,
    handleChooseClick,
  } = useUploadDropzone({
    files,
    maxFiles,
    maxSingleFileBytes,
    maxTotalContextBytes,
    onFilesUploaded,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        'rounded-xl border-2 border-dashed transition-colors duration-200',
        isDragOver
          ? 'border-primary bg-primary/5'
          : 'border-border/80 bg-background/60',
        isDisabled
          ? 'cursor-default'
          : 'cursor-pointer hover:border-muted-foreground/50',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFilePicker}
      onKeyDown={handleKeyDown}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept={CONTEXT_FILE_ACCEPT}
        disabled={isDisabled}
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
            <h3 className="text-lg font-semibold">
              {t('settings-dropzone-upload-title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('settings-dropzone-upload-hint')}
            </p>
          </div>
          <Button
            variant="secondary"
            size="lg"
            onClick={handleChooseClick}
            disabled={isDisabled}
          >
            {isLoading ? (
              <IconLoader2 className="size-4 animate-spin" />
            ) : (
              <IconPlus className="size-4" />
            )}
            {isLoading
              ? t('settings-dropzone-uploading')
              : t('settings-dropzone-choose-files')}
          </Button>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('settings-dropzone-supported-formats')}
          </p>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <FileGrid
            files={files}
            onFileDelete={onFileDelete}
            onFileClick={onFileClick}
            onFileReindex={onFileReindex}
            reindexingFileId={reindexingFileId}
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
                  ? t('settings-dropzone-uploading-files')
                  : t('settings-dropzone-drop-more')}
              </span>
            </div>
          )}

          <div className="space-y-2 border-t border-border/70 pt-3">
            <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
              <span>
                {t('settings-dropzone-files-count', {
                  count: files.length,
                  max: maxFiles,
                })}
              </span>
              <span>
                {t('settings-dropzone-used', {
                  used: usedLabel,
                  total: totalLabel,
                })}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={usageStyle}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
