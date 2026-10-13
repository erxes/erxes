import {
  Badge,
  Button,
  Dialog,
  Input,
  REACT_APP_API_URL,
  ScrollArea,
  Textarea,
  toast,
} from 'erxes-ui';
import {
  ensureContextFileName,
  formatContextFileSize,
  formatContextFileUploadedAt,
  getContextFileBaseName,
  getContextFileExtension,
  getContextFileVersionCount,
  TAiAgentContextFileVersion,
  TAiAgentContextFile,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { IconClock, IconLoader2, IconX } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

const readContextFile = async (
  file: TAiAgentContextFile | TAiAgentContextFileVersion,
) => {
  const response = await fetch(
    `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(file.key)}`,
    {
      credentials: 'include',
    },
  );

  const blob = await response.blob();
  const text = await blob.text();

  if (!response.ok) {
    throw new Error(text || 'Failed to load context file');
  }

  return text;
};

const uploadContextFile = async (file: File) => {
  const formData = new FormData();

  formData.append('file', file);

  const response = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  const key = await response.text();

  if (!response.ok) {
    throw new Error(key || 'Failed to upload context file');
  }

  return key;
};

const getContextFileMimeType = (name: string, currentType?: string) => {
  const normalizedName = name.toLowerCase();

  if (normalizedName.endsWith('.txt')) {
    return 'text/plain';
  }

  if (currentType?.trim()) {
    return currentType;
  }

  return 'text/markdown';
};

export const AiAgentContextFileEditorDialog = ({
  open,
  file,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  file: TAiAgentContextFile | null;
  onOpenChange: (open: boolean) => void;
  onSave: (file: TAiAgentContextFile) => void;
}) => {
  const { t } = useTranslation('automations');
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSourceKey, setSelectedSourceKey] = useState<string>('');
  const requestIdRef = useRef(0);

  const versions = useMemo(() => file?.versions || [], [file?.versions]);
  const fixedExtension = getContextFileExtension(file?.name) || '.md';

  const loadSource = async (
    source: TAiAgentContextFile | TAiAgentContextFileVersion,
  ) => {
    const nextRequestId = requestIdRef.current + 1;
    requestIdRef.current = nextRequestId;
    setSelectedSourceKey(source.key);
    setIsLoading(true);

    try {
      const markdown = await readContextFile(source);

      if (requestIdRef.current !== nextRequestId) {
        return;
      }

      setContent(markdown);
    } catch (error: any) {
      if (requestIdRef.current !== nextRequestId) {
        return;
      }

      toast({
        title: t('settings-editor-load-failed'),
        description:
          error instanceof Error
            ? error.message
            : t('settings-editor-try-again'),
        variant: 'destructive',
      });

      setContent('');
    } finally {
      if (requestIdRef.current === nextRequestId) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!open || !file) {
      return;
    }

    setName(getContextFileBaseName(file.name));
    void loadSource(file);
  }, [file, open]);

  const handleSave = async () => {
    if (!file) {
      return;
    }

    try {
      setIsSaving(true);

      const nextName = ensureContextFileName(name, file.name);
      const nextFile = new File([content], nextName, {
        type: getContextFileMimeType(nextName, file.type),
      });
      const nextKey = await uploadContextFile(nextFile);
      const uploadedAt = new Date().toISOString();

      onSave({
        ...file,
        key: nextKey,
        name: nextName,
        size: nextFile.size,
        type: nextFile.type,
        uploadedAt,
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: t('settings-editor-save-failed'),
        description:
          error instanceof Error
            ? error.message
            : t('settings-editor-try-again'),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="flex h-[85vh] max-w-6xl flex-col overflow-hidden p-0">
        <div className="border-b px-6 py-4">
          <Dialog.Header className="relative space-y-1 pr-12 text-left">
            <Dialog.Title>{t('settings-editor-title')}</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground">
              {t('settings-editor-description')}
            </Dialog.Description>
            <Dialog.Close asChild>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-0 top-0"
              >
                <IconX className="size-4" />
              </Button>
            </Dialog.Close>
          </Dialog.Header>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-h-0 flex-col border-r">
            <div className="space-y-4 border-b px-6 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">
                    {t('settings-editor-file-name')}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t('settings-editor-saving-creates')}
                  </p>
                </div>
                <Badge variant="secondary">
                  {t('settings-editor-previous-versions', {
                    count: getContextFileVersionCount(file || undefined),
                  })}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(event) =>
                    setName(getContextFileBaseName(event.target.value))
                  }
                  placeholder="context-file"
                  disabled={isSaving}
                />
                <div className="shrink-0 rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {fixedExtension}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('settings-editor-only-name-changes')}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden px-6 py-4">
              <div className="h-full overflow-hidden rounded-xl border bg-background">
                {isLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    {t('settings-editor-loading-markdown')}
                  </div>
                ) : (
                  <Textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    className="h-full min-h-full resize-none border-0 bg-transparent p-4 font-mono text-sm shadow-none focus-visible:ring-0"
                    placeholder={t('settings-editor-markdown-placeholder')}
                    disabled={isSaving}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="min-h-0 min-w-0 bg-muted/20">
            <ScrollArea className="h-full" viewportClassName="[&>div]:!block">
              <div className="space-y-4 p-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">
                    {t('settings-editor-current-file')}
                  </h3>
                  <button
                    type="button"
                    onClick={() => file && void loadSource(file)}
                    className={`w-full rounded-xl border bg-background px-4 py-3 text-left text-sm transition-colors ${
                      selectedSourceKey === file?.key
                        ? 'border-primary bg-primary/5'
                        : 'hover:border-border hover:bg-accent/20'
                    }`}
                  >
                    <div className="break-all font-medium">
                      {file?.name || t('sidebar-untitled')}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatContextFileSize(file?.size)}
                    </div>
                    {formatContextFileUploadedAt(file?.uploadedAt) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {t('settings-files-added', {
                          date: formatContextFileUploadedAt(file?.uploadedAt),
                        })}
                      </div>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <IconClock className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">
                      {t('settings-editor-version-history')}
                    </h3>
                  </div>

                  {versions.length ? (
                    <div className="space-y-2">
                      {versions.map((version) => (
                        <button
                          type="button"
                          key={`${version.key}-${
                            version.uploadedAt || version.name
                          }`}
                          onClick={() => void loadSource(version)}
                          className={`w-full rounded-xl border bg-background px-4 py-3 text-left text-sm transition-colors ${
                            selectedSourceKey === version.key
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-border hover:bg-accent/20'
                          }`}
                        >
                          <div className="break-all font-medium">
                            {version.name}
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatContextFileSize(version.size)}
                          </div>
                          {formatContextFileUploadedAt(version.uploadedAt) && (
                            <div className="mt-1 text-xs text-muted-foreground">
                              {t('settings-editor-saved-at', {
                                date: formatContextFileUploadedAt(
                                  version.uploadedAt,
                                ),
                              })}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed bg-background px-4 py-6 text-sm text-muted-foreground">
                      {t('settings-editor-no-versions')}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        <Dialog.Footer className="border-t px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
          >
            {isSaving ? (
              <>
                <IconLoader2 className="mr-2 size-4 animate-spin" />
                {t('common-saving')}
              </>
            ) : (
              t('save')
            )}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
