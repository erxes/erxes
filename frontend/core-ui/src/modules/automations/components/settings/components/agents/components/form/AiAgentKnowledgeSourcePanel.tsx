import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { AiAgentContextFilesForm } from '@/automations/components/settings/components/agents/components/form/AiAgentContextFilesForm';
import { AiAgentProductKnowledgeForm } from '@/automations/components/settings/components/agents/components/form/AiAgentProductKnowledgeForm';
import { useAiAgentKnowledgeSources } from '@/automations/components/settings/components/agents/context/AiAgentKnowledgeSourcesContext';
import {
  CONTEXT_FILES_KEY,
  findSourceSelection,
  getSourceStatuses,
  hasSourceSelection,
} from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { Switch } from 'erxes-ui';
import { TAiKnowledgeSourceConfig } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const AiAgentKnowledgeSourceSelector = ({
  source,
}: {
  source: TAiKnowledgeSourceConfig;
}) => {
  const { t } = useTranslation('automations');
  const {
    knowledgeSources,
    statuses,
    handleSourceIdsChange,
    handleSourceEnabledChange,
    handleSourceScopeChange,
  } = useAiAgentKnowledgeSources();

  const selection = findSourceSelection(knowledgeSources, source);
  const sourceStatuses = getSourceStatuses(statuses, source);
  const isFullScope = selection?.scope === 'all';

  const scopeToggle = source.supportsFullScope ? (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div>
        <p className="text-sm font-medium">
          {t('settings-knowledge-use-whole-source')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('settings-knowledge-use-whole-source-description')}
        </p>
      </div>
      <Switch
        checked={isFullScope}
        onCheckedChange={(checked) =>
          handleSourceScopeChange(source, checked ? 'all' : 'selected')
        }
      />
    </div>
  ) : null;
  const emptyWarning = hasSourceSelection(selection) ? null : (
    <p className="text-xs text-destructive">
      {t('settings-knowledge-nothing-selected')}
    </p>
  );

  if (source.sourceSelector === 'local') {
    return (
      <div className="flex flex-col gap-3">
        {scopeToggle}
        {emptyWarning}
        {!isFullScope && (
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
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {scopeToggle}
      {emptyWarning}
      {!isFullScope && (
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
      )}
    </div>
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
