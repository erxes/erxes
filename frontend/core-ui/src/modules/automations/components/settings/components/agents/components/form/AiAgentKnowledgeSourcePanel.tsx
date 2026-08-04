import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { AiAgentContextFilesForm } from '@/automations/components/settings/components/agents/components/form/AiAgentContextFilesForm';
import { AiAgentProductKnowledgeForm } from '@/automations/components/settings/components/agents/components/form/AiAgentProductKnowledgeForm';
import { useAiAgentKnowledgeSources } from '@/automations/components/settings/components/agents/context/AiAgentKnowledgeSourcesContext';
import {
  CONTEXT_FILES_KEY,
  findSourceSelection,
  getSourceStatuses,
} from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { TAiKnowledgeSourceConfig } from 'ui-modules';

const AiAgentKnowledgeSourceSelector = ({
  source,
}: {
  source: TAiKnowledgeSourceConfig;
}) => {
  const {
    knowledgeSources,
    statuses,
    handleSourceIdsChange,
    handleSourceEnabledChange,
  } = useAiAgentKnowledgeSources();

  const selection = findSourceSelection(knowledgeSources, source);
  const sourceStatuses = getSourceStatuses(statuses, source);

  if (source.sourceSelector === 'local') {
    return (
      <AiAgentProductKnowledgeForm
        enabled={!!selection}
        value={selection?.sourceIds || []}
        config={selection?.config || {}}
        statuses={sourceStatuses}
        onEnabledChange={(enabled) =>
          handleSourceEnabledChange(source, enabled)
        }
        onChange={(sourceIds, config) =>
          handleSourceIdsChange(source, sourceIds, config)
        }
      />
    );
  }

  return (
    <RenderPluginsComponentWrapper
      pluginName={source.pluginName}
      moduleName={source.moduleName}
      props={{
        componentType: 'aiKnowledgeSourceSelector',
        source,
        value: selection?.sourceIds || [],
        config: selection?.config || {},
        statuses: sourceStatuses,
        onChange: (sourceIds: string[], config?: Record<string, unknown>) =>
          handleSourceIdsChange(source, sourceIds, config),
      }}
    />
  );
};

export const AiAgentKnowledgeSourcePanel = ({
  activeKey,
  activeSource,
}: {
  activeKey?: string;
  activeSource?: TAiKnowledgeSourceConfig;
}) => {
  if (activeKey === CONTEXT_FILES_KEY) {
    return <AiAgentContextFilesForm />;
  }

  if (!activeSource) {
    return null;
  }

  return <AiAgentKnowledgeSourceSelector source={activeSource} />;
};
