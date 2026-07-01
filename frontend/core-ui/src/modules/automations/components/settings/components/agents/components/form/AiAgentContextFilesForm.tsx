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
import { useParams } from 'react-router';
import { useTranslation } from 'react-i18next';

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
          Attach markdown or plain text files that should be passed to the
          external AI provider as runtime knowledge.
        </p>
        <p className="text-xs text-muted-foreground">
          Limits: up to {AI_AGENT_UI_LIMITS.maxFiles} files,{' '}
          {formatBytes(AI_AGENT_UI_LIMITS.maxSingleFileBytes)} per file,{' '}
          {formatBytes(AI_AGENT_UI_LIMITS.maxTotalContextBytes)} total.
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
                              title: t('reindex-queued', 'Reindex queued'),
                              description:
                                t('reindex-queued-description', 'Knowledge chunks will refresh in the background.'),
                              variant: 'success',
                            });
                          } catch (error) {
                            toast({
                              title: t('could-not-queue-reindex', 'Could not queue reindex'),
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
                Keep files focused and compact so health checks stay green,
                prompts stay small, and the provider responds quickly.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          );
        }}
      />
    </div>
  );
};
