import { AiAgentKnowledgeSourcesForm } from '@/automations/components/settings/components/agents/components/form/AiAgentKnowledgeSourcesForm';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useSessionTab } from '@/automations/hooks/useSessionTab';
import { Form, Tabs, Textarea } from 'erxes-ui';
import { IconBooks, IconMessageCog } from '@tabler/icons-react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

const AI_AGENT_CONTEXT_TABS = ['instructions', 'knowledge'];

export const AiAgentContextForm = () => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentForm>();
  const [activeTab, setActiveTab] = useSessionTab(
    'aiAgentContext',
    'instructions',
    AI_AGENT_CONTEXT_TABS,
  );

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col "
    >
      <Tabs.List variant="segment">
        <Tabs.Trigger value="instructions">
          <IconMessageCog className="size-4" />
          {t('instructions', 'Instructions')}
        </Tabs.Trigger>
        <Tabs.Trigger value="knowledge">
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
