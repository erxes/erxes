import { AiAgentContextFileEditorDialog } from '@/automations/components/settings/components/agents/components/AiAgentContextFileEditorDialog';
import { UploadDropzone } from '@/automations/components/settings/components/agents/components/DropFilesZone';
import { AUTOMATIONS_AI_AGENT_REINDEX } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  getNextContextFilesAfterEdit,
  mapUploadedContextFiles,
} from '@/automations/components/settings/components/agents/utils/contextFiles';
import { Card, Form, Textarea, toast } from 'erxes-ui';
import { useMutation } from '@apollo/client';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'react-router';

const AI_AGENT_UI_LIMITS = {
  maxFiles: 10,
  maxSingleFileBytes: 50_000,
  maxTotalContextBytes: 200_000,
} as const;

const formatBytes = (bytes: number) => {
  if (bytes >= 1000) {
    return `${Math.round(bytes / 1000)} KB`;
  }

  return `${bytes} B`;
};

export const AiAgentContextForm = () => {
  const { id } = useParams();
  const { control } = useFormContext<TAiAgentForm>();
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [reindexingFileId, setReindexingFileId] = useState<string | null>(null);
  const [reindex] = useMutation(AUTOMATIONS_AI_AGENT_REINDEX);

  return (
    <div className="grid gap-4">
      <Card className="p-4">
        <Form.Field
          control={control}
          name="context.systemPrompt"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>System Prompt</Form.Label>
              <Form.Control>
                <Textarea
                  rows={10}
                  placeholder="You are an automation AI bridge. Use the provided context, follow the requested output format, and never invent facts."
                  {...field}
                />
              </Form.Control>
              <Form.Description>
                Define the runtime rules that every AI action should follow
                before user input and context files are injected.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      </Card>

      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-medium">Context Files</h3>
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
                      maxTotalContextBytes={
                        AI_AGENT_UI_LIMITS.maxTotalContextBytes
                      }
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
                                  title: 'Reindex queued',
                                  description:
                                    'Knowledge chunks will refresh in the background.',
                                  variant: 'success',
                                });
                              } catch (error) {
                                toast({
                                  title: 'Could not queue reindex',
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
      </Card>
    </div>
  );
};
