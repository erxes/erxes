import { UploadDropzone } from '@/automations/components/settings/components/agents/components/DropFilesZone';
import { FileGrid } from '@/automations/components/settings/components/agents/components/FilesList';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Card, Form, Textarea } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

export const AiAgentContextForm = () => {
  const { control } = useFormContext<TAiAgentForm>();

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
          </div>

          <Form.Field
            control={control}
            name="context.files"
            render={({ field }) => (
              <UploadDropzone
                onFilesUploaded={(files) => {
                  const newFiles = files.map(
                    ({ key, name, size, type, uploadedAt }) => ({
                      id: Math.random().toString(36).slice(2, 11),
                      key,
                      name,
                      size,
                      type,
                      uploadedAt: uploadedAt.toISOString(),
                    }),
                  );

                  field.onChange([...(field.value || []), ...newFiles]);
                }}
              />
            )}
          />

          <Form.Field
            control={control}
            name="context.files"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Attached Files</Form.Label>
                <Form.Control>
                  <FileGrid
                    files={field.value || []}
                    onFileDelete={(fileId) =>
                      field.onChange(
                        (field.value || []).filter(({ id }) => fileId !== id),
                      )
                    }
                  />
                </Form.Control>
                <Form.Description>
                  Keep files focused and compact so health checks stay green and
                  the provider responds quickly.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      </Card>
    </div>
  );
};
