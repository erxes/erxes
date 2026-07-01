import { AiAgentKnowledgeSourcesForm } from '@/automations/components/settings/components/agents/components/form/AiAgentKnowledgeSourcesForm';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Tabs, Textarea } from 'erxes-ui';
import { IconBooks, IconMessageCog } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const AiAgentContextForm = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <Tabs defaultValue="instructions" className="flex flex-col ">
      <Tabs.List className="h-auto w-fit gap-1 rounded-lg border-b-0 bg-muted p-1">
        <Tabs.Trigger
          value="instructions"
          className="gap-2 rounded-md text-muted-foreground after:hidden data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-background"
        >
          <IconMessageCog className="size-4" />
          {t('instructions', 'Instructions')}
        </Tabs.Trigger>
        <Tabs.Trigger
          value="knowledge"
          className="gap-2 rounded-md text-muted-foreground after:hidden data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:hover:bg-background"
        >
          <IconBooks className="size-4" />
          {t('knowledge', 'Knowledge')}
        </Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="instructions" className="mt-4">
        <Form.Field
          control={control}
          name="context.systemPrompt"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>{t('system-prompt', 'System Prompt')}</Form.Label>
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
      </Tabs.Content>

      <Tabs.Content value="knowledge" className="mt-4">
        <AiAgentKnowledgeSourcesForm />
      </Tabs.Content>
    </Tabs>
  );
};
