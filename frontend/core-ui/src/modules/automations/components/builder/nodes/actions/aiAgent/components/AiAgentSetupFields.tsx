import { AiAgentInputFields } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentInputFields';
import { AI_AGENT_NODE_GOAL_TYPES } from '@/automations/components/builder/nodes/actions/aiAgent/constants/aiAgentConfigForm';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { IconExternalLink, IconPlus } from '@tabler/icons-react';
import { Button, Form, Select, Textarea } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

// What runs and on what: the agent, the goal, the input and its prompts.
export const AiAgentSetupFields = ({
  agents,
  agentSelectOpen,
  onAgentSelectOpenChange,
  onOpenAgentSheet,
}: {
  agents: { _id: string; name: string }[];
  agentSelectOpen: boolean;
  onAgentSelectOpenChange: (open: boolean) => void;
  onOpenAgentSheet: (agentId?: string) => void;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const goalType = useWatch({ control, name: 'goalType' });

  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={control}
        name="aiAgentId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('ai-agent')}</Form.Label>
            <div className="mt-1 flex items-center gap-2">
              <Select
                value={field.value}
                onValueChange={field.onChange}
                open={agentSelectOpen}
                onOpenChange={onAgentSelectOpenChange}
              >
                <Select.Trigger className="min-w-0 flex-1">
                  <Select.Value placeholder={t('select-ai-agent')} />
                </Select.Trigger>
                <Select.Content>
                  {agents.map(({ _id, name }) => (
                    <Select.Item key={_id} value={_id}>
                      {name}
                    </Select.Item>
                  ))}
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => onOpenAgentSheet()}
                  >
                    <IconPlus /> {t('add-new-agent')}
                  </Button>
                </Select.Content>
              </Select>
              {/* The selected agent when there is one, a new agent otherwise */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={field.value ? t('ai-agent') : t('add-new-agent')}
                onClick={() => onOpenAgentSheet(field.value || undefined)}
              >
                <IconExternalLink className="size-4" />
              </Button>
            </div>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="goalType"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('goal-type')}</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="mt-1">
                <Select.Value placeholder={t('select-goal-type')} />
              </Select.Trigger>
              <Select.Content>
                {AI_AGENT_NODE_GOAL_TYPES.map(({ type, labelKey }) => (
                  <Select.Item key={type} value={type}>
                    {t(labelKey)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />

      <AiAgentInputFields />

      {goalType === 'generateText' && (
        <>
          <Form.Field
            name="prompt"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('instruction-prompt')}</Form.Label>
                <Textarea placeholder={t('enter-prompt')} {...field} />
                <Form.Description>
                  {t('instruction-prompt-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            name="fallbackText"
            control={control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('fallback-text')}</Form.Label>
                <Textarea
                  placeholder={t('fallback-text-placeholder')}
                  {...field}
                />
                <Form.Description>
                  {t('fallback-text-description')}
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </>
      )}
    </div>
  );
};
