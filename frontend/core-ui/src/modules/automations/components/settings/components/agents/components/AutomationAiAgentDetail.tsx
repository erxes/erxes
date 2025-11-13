import { UploadDropzone } from '@/automations/components/settings/components/agents/components/DropFilesZone';
import { FileGrid } from '@/automations/components/settings/components/agents/components/FilesList';
import { AiAgentGeneralForm } from '@/automations/components/settings/components/agents/components/form/AiAgentGeneralForm';
import { AutomationAiAgentTrainingWrapper } from '@/automations/components/settings/components/agents/components/form/AutomationAiAgentTrainingWrapper';
import { AI_AGENT_KINDS } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { AiAgentInput } from '@/automations/components/settings/components/agents/hooks/useAiAgentDetail';
import {
  aiAgentFormSchema,
  TAiAgentForm,
} from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Form, Tabs, toast } from 'erxes-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { Link } from 'react-router';

export const AutomationAiAgentDetail = ({
  detail,
  handleSave,
}: {
  detail: any;
  handleSave: (input: AiAgentInput) => Promise<any>;
}) => {
  const form = useForm<TAiAgentForm>({
    resolver: zodResolver(aiAgentFormSchema),
    values: {
      ...detail,
    },
  });

  const { img, label } =
    AI_AGENT_KINDS.find(({ type }) => type === detail?.provider) || {};

  return (
    <div className="h-full w-full flex flex-col">
      <div className="bg-sidebar py-2 px-4 border-b">
        <Card className="p-3 flex flex-col gap-2 rounded-lg w-48">
          <div className="flex gap-2 mb-2 items-center">
            <div className="size-8 rounded overflow-hidden shadow-sm bg-background">
              <img
                src={img}
                alt={detail?.provider}
                className="w-full h-full object-contain p-1"
              />
            </div>
            <h6 className="font-semibold text-sm self-center">{label}</h6>
          </div>
        </Card>
      </div>
      <div className="flex flex-col flex-1  px-4 pb-4">
        <FormProvider {...form}>
          <Tabs defaultValue="general" className="flex-1">
            <Tabs.List>
              <Tabs.Trigger className="w-1/3" value="general">
                General
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/3" value="files">
                Files
              </Tabs.Trigger>
              <Tabs.Trigger className="w-1/3" value="training">
                Training
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="general" className="flex flex-col gap-2">
              <AiAgentGeneralForm />
            </Tabs.Content>
            <Tabs.Content value="files" className="px-6 py-4">
              <Form.Field
                control={form.control}
                name="files"
                render={({ field }) => (
                  <UploadDropzone
                    onFilesUploaded={(files) => {
                      const newFiles = files.map(
                        ({ key, name, size, type, uploadedAt }) => ({
                          id: Math.random().toString(36).substr(2, 9),
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
                control={form.control}
                name="files"
                render={({ field }) => (
                  <Form.Item className="pt-4">
                    <Form.Label>Uploaded Files</Form.Label>
                    <Form.Control className="">
                      <FileGrid
                        files={field.value}
                        onFileDelete={(fileId) =>
                          field.onChange(
                            field.value.filter(({ id }) => fileId !== id),
                          )
                        }
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </Tabs.Content>
            <Tabs.Content
              value="training"
              className="flex flex-col h-full py-2"
            >
              <AutomationAiAgentTrainingWrapper agentId={detail?._id} />
            </Tabs.Content>
          </Tabs>
          <div className="flex justify-end pt-4 gap-2">
            <Link to={`/settings/automations/agents`}>
              <Button variant="secondary">Back</Button>
            </Link>
            <Button
              onClick={form.handleSubmit(handleSave, (error) => {
                toast({
                  title: 'Invalid form',
                  description: JSON.stringify(error),
                });
              })}
            >
              Save
            </Button>
          </div>
        </FormProvider>
      </div>
    </div>
  );
};
