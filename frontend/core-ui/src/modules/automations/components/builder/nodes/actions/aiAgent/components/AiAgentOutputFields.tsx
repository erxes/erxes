import { AiAgentObjectBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentObjectBuilder';
import { AiAgentToolBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentToolBuilder';
import { AiAgentTopicBuilder } from '@/automations/components/builder/nodes/actions/aiAgent/components/AiAgentTopicBuilder';
import { TAiAgentOutputTab } from '@/automations/components/builder/nodes/actions/aiAgent/hooks/useAiAgentConfigTabs';
import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Tabs } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

/**
 * What the run produces, per goal: topics to branch on, fields to classify
 * into, or for generated text the fields captured alongside it and the tools
 * it may call.
 */
export const AiAgentOutputFields = ({
  outputTab,
  onOutputTabChange,
}: {
  outputTab: TAiAgentOutputTab;
  onOutputTabChange: (tab: TAiAgentOutputTab) => void;
}) => {
  const { t } = useTranslation('automations');
  const { control } = useFormContext<TAiAgentConfigForm>();
  const goalType = useWatch({ control, name: 'goalType' });
  const captureCount = (useWatch({ control, name: 'captureFields' }) || [])
    .length;
  const toolCount = (useWatch({ control, name: 'tools' }) || []).length;

  if (goalType === 'splitTopic') {
    return <AiAgentTopicBuilder />;
  }

  if (goalType === 'classification') {
    return <AiAgentObjectBuilder />;
  }

  if (goalType !== 'generateText') {
    return (
      <p className="text-sm text-muted-foreground">
        {t('ai-agent-output-select-goal')}
      </p>
    );
  }

  return (
    <Tabs
      value={outputTab}
      onValueChange={(value) => onOutputTabChange(value as TAiAgentOutputTab)}
    >
      <Tabs.List className="mb-3 w-fit">
        <Tabs.Trigger value="fields">
          {t('ai-agent-fields')}
          <AiAgentCount count={captureCount} />
        </Tabs.Trigger>
        <Tabs.Trigger value="tools">
          {t('ai-agent-tools')}
          <AiAgentCount count={toolCount} />
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="fields" className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {t('capture-fields-description')}
        </p>
        <AiAgentObjectBuilder name="captureFields" />
      </Tabs.Content>
      <Tabs.Content value="tools">
        <AiAgentToolBuilder />
      </Tabs.Content>
    </Tabs>
  );
};

export const AiAgentCount = ({ count }: { count: number }) =>
  count ? (
    <span className="ml-1.5 rounded-sm bg-muted px-1.5 text-xs text-muted-foreground">
      {count}
    </span>
  ) : null;
