import { AiAgentKnowledgeSourcePanel } from '@/automations/components/settings/components/agents/components/form/AiAgentKnowledgeSourcePanel';
import { AiAgentKnowledgeSourceRail } from '@/automations/components/settings/components/agents/components/form/AiAgentKnowledgeSourceRail';
import { AiAgentKnowledgeSourcesProvider } from '@/automations/components/settings/components/agents/context/AiAgentKnowledgeSourcesContext';
import { useAiAgentKnowledgeSourceRail } from '@/automations/components/settings/components/agents/hooks/useAiAgentKnowledgeSourceRail';
import { useAiAgentKnowledgeSourceSelections } from '@/automations/components/settings/components/agents/hooks/useAiAgentKnowledgeSourceSelections';
import { useAiAgentKnowledgeSourceStatuses } from '@/automations/components/settings/components/agents/hooks/useAiAgentKnowledgeSourceStatuses';
import { useTranslation } from 'react-i18next';

export const AiAgentKnowledgeSourcesForm = () => {
  const { t } = useTranslation('automations');
  const { statuses, indexedCount, indexingCount } =
    useAiAgentKnowledgeSourceStatuses();
  const { knowledgeSources, handleSourceIdsChange, handleSourceEnabledChange } =
    useAiAgentKnowledgeSourceSelections();
  const { railItems, resolvedKey, setActiveKey, activeSource } =
    useAiAgentKnowledgeSourceRail(knowledgeSources);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">{t('knowledge-sources')}</h3>
        <span className="text-xs text-muted-foreground">
          {indexedCount} indexed · {indexingCount} indexing
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('knowledge-sources-description')}
      </p>

      <div className="mt-4 flex gap-4">
        <AiAgentKnowledgeSourceRail
          items={railItems}
          activeKey={resolvedKey}
          onSelect={setActiveKey}
        />

        <div className="min-w-0 flex-1">
          <AiAgentKnowledgeSourcesProvider
            value={{
              knowledgeSources,
              statuses,
              handleSourceIdsChange,
              handleSourceEnabledChange,
            }}
          >
            <AiAgentKnowledgeSourcePanel
              activeKey={resolvedKey}
              activeSource={activeSource}
            />
          </AiAgentKnowledgeSourcesProvider>
        </div>
      </div>
    </div>
  );
};
