import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { AiAgentContextFilesForm } from '@/automations/components/settings/components/agents/components/form/AiAgentContextFilesForm';
import { AiAgentProductKnowledgeForm } from '@/automations/components/settings/components/agents/components/form/AiAgentProductKnowledgeForm';
import { useQuery } from '@apollo/client';
import { cn } from 'erxes-ui';
import { IconFileText, IconPaperclip } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  TAiKnowledgeSourceConfig,
  TAiKnowledgeSourceIndexStatus,
} from 'ui-modules';

type TAiKnowledgeSourcesResponse = {
  automationConstants?: {
    aiKnowledgeSourcesConst?: TAiKnowledgeSourceConfig[];
  };
};

type TAiKnowledgeSourceStatusesResponse = {
  automationsAiAgentKnowledgeSourceStatuses?: TAiKnowledgeSourceIndexStatus[];
};

const CONTEXT_FILES_KEY = '__context-files__';

const getSourceKey = (source: TAiKnowledgeSourceConfig) =>
  `${source.pluginName}:${source.moduleName}:${source.key}`;

const getSourceIds = ({
  sources,
  source,
}: {
  sources: TAiAgentForm['context']['knowledgeSources'];
  source: TAiKnowledgeSourceConfig;
}) =>
  sources.find(
    (selection) =>
      selection.pluginName === source.pluginName &&
      selection.moduleName === source.moduleName &&
      selection.key === source.key,
  )?.sourceIds || [];

export const AiAgentKnowledgeSourcesForm = () => {
  const { t } = useTranslation('automations');
  const { id: agentId } = useParams();
  const { control, setValue } = useFormContext<TAiAgentForm>();
  const knowledgeSources =
    useWatch({ control, name: 'context.knowledgeSources' }) || [];
  const files = useWatch({ control, name: 'context.files' }) || [];
  const { data } = useQuery<TAiKnowledgeSourcesResponse>(AUTOMATION_CONSTANTS);
  const {
    data: statusData,
    startPolling,
    stopPolling,
  } = useQuery<TAiKnowledgeSourceStatusesResponse>(
    AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES,
    {
      variables: { agentId },
      skip: !agentId,
    },
  );
  const sources = data?.automationConstants?.aiKnowledgeSourcesConst || [];
  const statuses = statusData?.automationsAiAgentKnowledgeSourceStatuses || [];
  const hasActiveIndexing = statuses.some(
    (status) => status.status === 'queued' || status.status === 'indexing',
  );
  const indexedCount = statuses.filter(
    (status) => status.status === 'indexed',
  ).length;
  const indexingCount = statuses.filter(
    (status) => status.status === 'queued' || status.status === 'indexing',
  ).length;

  const [activeKey, setActiveKey] = useState<string>(() =>
    sources.length ? getSourceKey(sources[0]) : CONTEXT_FILES_KEY,
  );

  useEffect(() => {
    if (!agentId || !hasActiveIndexing) {
      stopPolling();
      return;
    }

    startPolling(3000);

    return stopPolling;
  }, [agentId, hasActiveIndexing, startPolling, stopPolling]);

  const railItems = [
    ...sources.map((source) => ({
      key: getSourceKey(source),
      label: source.label,
      count: getSourceIds({ sources: knowledgeSources, source }).length,
      icon: IconFileText,
    })),
    {
      key: CONTEXT_FILES_KEY,
      label: 'Context files',
      count: files.length,
      icon: IconPaperclip,
    },
  ];

  const resolvedKey = railItems.some((item) => item.key === activeKey)
    ? activeKey
    : railItems[0]?.key;
  const activeSource = sources.find(
    (source) => getSourceKey(source) === resolvedKey,
  );

  const handleSourceIdsChange = (
    source: TAiKnowledgeSourceConfig,
    sourceIds: string[],
  ) => {
    const sourceIndex = knowledgeSources.findIndex(
      (selection) =>
        selection.pluginName === source.pluginName &&
        selection.moduleName === source.moduleName &&
        selection.key === source.key,
    );
    const nextKnowledgeSources = [...knowledgeSources];

    if (sourceIds.length) {
      const selection = {
        pluginName: source.pluginName,
        moduleName: source.moduleName,
        key: source.key,
        sourceIds,
      };

      if (sourceIndex === -1) {
        nextKnowledgeSources.push(selection);
      } else {
        nextKnowledgeSources[sourceIndex] = selection;
      }
    } else if (sourceIndex !== -1) {
      nextKnowledgeSources.splice(sourceIndex, 1);
    }

    setValue('context.knowledgeSources', nextKnowledgeSources, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

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
        <nav className="w-52 shrink-0 space-y-1 border-r pr-2">
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === resolvedKey;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveKey(item.key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left transition-colors',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/60',
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate text-sm font-medium">
                  {item.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {item.count}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1">
          {resolvedKey === CONTEXT_FILES_KEY ? (
            <AiAgentContextFilesForm />
          ) : activeSource ? (
            activeSource.sourceSelector === 'local' ? (
              <AiAgentProductKnowledgeForm
                value={getSourceIds({
                  sources: knowledgeSources,
                  source: activeSource,
                })}
                statuses={statuses.filter(
                  (status) =>
                    status.pluginName === activeSource.pluginName &&
                    status.moduleName === activeSource.moduleName &&
                    status.sourceKey === activeSource.key,
                )}
                onChange={(sourceIds) =>
                  handleSourceIdsChange(activeSource, sourceIds)
                }
              />
            ) : (
              <RenderPluginsComponentWrapper
                pluginName={activeSource.pluginName}
                moduleName={activeSource.moduleName}
                props={{
                  componentType: 'aiKnowledgeSourceSelector',
                  source: activeSource,
                  value: getSourceIds({
                    sources: knowledgeSources,
                    source: activeSource,
                  }),
                  statuses: statuses.filter(
                    (status) =>
                      status.pluginName === activeSource.pluginName &&
                      status.moduleName === activeSource.moduleName &&
                      status.sourceKey === activeSource.key,
                  ),
                  onChange: (sourceIds: string[]) =>
                    handleSourceIdsChange(activeSource, sourceIds),
                }}
              />
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};
