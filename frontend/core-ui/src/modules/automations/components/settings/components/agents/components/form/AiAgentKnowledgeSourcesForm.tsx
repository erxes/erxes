import { RenderPluginsComponentWrapper } from '@/automations/components/common/RenderPluginsComponentWrapper';
import { AUTOMATION_CONSTANTS } from '@/automations/graphql/automationQueries';
import { AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';
import { Card } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useFormContext, useWatch } from 'react-hook-form';
import { useParams } from 'react-router';
import { useEffect } from 'react';
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

  useEffect(() => {
    if (!agentId || !hasActiveIndexing) {
      stopPolling();
      return;
    }

    startPolling(3000);

    return stopPolling;
  }, [agentId, hasActiveIndexing, startPolling, stopPolling]);

  if (!sources.length) {
    return null;
  }

  return (
    <Card className="p-4">
      <div className="space-y-1">
        <h3 className="text-sm font-medium">{t('knowledge-sources')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('knowledge-sources-description')}
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {sources.map((source) => (
          <div key={`${source.pluginName}:${source.moduleName}:${source.key}`}>
            <p className="mb-2 text-sm font-medium">{source.label}</p>
            <RenderPluginsComponentWrapper
              pluginName={source.pluginName}
              moduleName={source.moduleName}
              props={{
                componentType: 'aiKnowledgeSourceSelector',
                source,
                value: getSourceIds({ sources: knowledgeSources, source }),
                statuses: statuses.filter(
                  (status) =>
                    status.pluginName === source.pluginName &&
                    status.moduleName === source.moduleName &&
                    status.sourceKey === source.key,
                ),
                onChange: (sourceIds) => {
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
                },
              }}
            />
          </div>
        ))}
      </div>
    </Card>
  );
};
