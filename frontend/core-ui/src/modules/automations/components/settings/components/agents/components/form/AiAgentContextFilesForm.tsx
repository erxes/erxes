import { AiAgentContextFileEditorDialog } from '@/automations/components/settings/components/agents/components/AiAgentContextFileEditorDialog';
import { UploadDropzone } from '@/automations/components/settings/components/agents/components/DropFilesZone';
import { AUTOMATIONS_AI_AGENT_REINDEX } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  getNextContextFilesAfterEdit,
  mapUploadedContextFiles,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Form, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

export const AI_AGENT_UI_LIMITS = {
  maxFiles: 10,
  maxSingleFileBytes: 50_000,
  maxTotalContextBytes: 200_000,
} as const;

export const formatBytes = (bytes: number) => {
  if (bytes >= 1000) {
    return `${Math.round(bytes / 1000)} KB`;
  }

  return `${bytes} B`;
};

export const AiAgentContextFilesForm = () => {
  const { t } = useTranslation('automations');
  const { id } = useParams();
  const { control } = useFormContext<TAiAgentForm>();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [reindexingFileId, setReindexingFileId] = useState<string | null>(null);
  const [reindex] = useMutation(AUTOMATIONS_AI_AGENT_REINDEX);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          {t('settings-context-files-attach')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('settings-context-files-limits', {
            maxFiles: AI_AGENT_UI_LIMITS.maxFiles,
            single: formatBytes(AI_AGENT_UI_LIMITS.maxSingleFileBytes),
            total: formatBytes(AI_AGENT_UI_LIMITS.maxTotalContextBytes),
          })}
        </p>
      </div>

      <Form.Field
        control={control}
        name="context.files"
        render={({ field }) => {
          const files = field.value || [];
          const editingFile =
            files.find(({ id }) => id === editingFileId) || null;

          return (
            <Form.Item>
              <Form.Control>
                <UploadDropzone
                  files={files}
                  maxFiles={AI_AGENT_UI_LIMITS.maxFiles}
                  maxSingleFileBytes={AI_AGENT_UI_LIMITS.maxSingleFileBytes}
                  maxTotalContextBytes={AI_AGENT_UI_LIMITS.maxTotalContextBytes}
                  onFilesUploaded={(uploadedFiles) => {
                    field.onChange([
                      ...files,
                      ...mapUploadedContextFiles(uploadedFiles),
                    ]);
                  }}
                  onFileDelete={(fileId) => {
                    if (editingFileId === fileId) {
                      setEditingFileId(null);
                    }

                    field.onChange(files.filter(({ id }) => fileId !== id));
                  }}
                  onFileClick={setEditingFileId}
                  onFileReindex={
                    id
                      ? async (fileId) => {
                          setReindexingFileId(fileId);

                          try {
                            await reindex({
                              variables: { id, fileId },
                            });
                            toast({
                              title: t('settings-context-files-reindex-queued'),
                              description: t(
                                'settings-context-files-reindex-queued-description',
                              ),
                              variant: 'success',
                            });
                          } catch (error) {
                            toast({
                              title: t('settings-context-files-reindex-failed'),
                              description: (error as Error).message,
                              variant: 'destructive',
                            });
                          } finally {
                            setReindexingFileId(null);
                          }
                        }
                      : undefined
                  }
                  reindexingFileId={reindexingFileId}
                />
              </Form.Control>
              <AiAgentContextFileEditorDialog
                open={!!editingFile}
                file={editingFile}
                onOpenChange={(open) => {
                  if (!open) {
                    setEditingFileId(null);
                  }
                }}
                onSave={(nextFile) => {
                  field.onChange(
                    getNextContextFilesAfterEdit({
                      files,
                      fileId: nextFile.id,
                      uploadedFile: nextFile,
                    }),
                  );
                }}
              />
              <Form.Description>
                {t('settings-context-files-keep-focused')}
              </Form.Description>
              <Form.Message />
            </Form.Item>
          );
        }}
      />
    </div>
  );
};
