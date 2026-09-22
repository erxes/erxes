import { AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { useParams } from 'react-router';
import { TAiKnowledgeSourceIndexStatus } from 'ui-modules';

type TAiKnowledgeSourceStatusesResponse = {
  automationsAiAgentKnowledgeSourceStatuses?: TAiKnowledgeSourceIndexStatus[];
};

const isIndexingStatus = (status: TAiKnowledgeSourceIndexStatus) =>
  status.status === 'queued' || status.status === 'indexing';

/**
 * Indexing statuses of the current agent's knowledge sources. Polls every 3s
 * while any source is queued or indexing, and stops once everything settles.
 */
export const useAiAgentKnowledgeSourceStatuses = () => {
  const { id: agentId } = useParams();
  const { data, startPolling, stopPolling } =
    useQuery<TAiKnowledgeSourceStatusesResponse>(
      AUTOMATIONS_AI_AGENT_KNOWLEDGE_SOURCE_STATUSES,
      {
        variables: { agentId },
        skip: !agentId,
      },
    );

  const statuses = data?.automationsAiAgentKnowledgeSourceStatuses || [];
  const hasActiveIndexing = statuses.some(isIndexingStatus);

  useEffect(() => {
    if (!agentId || !hasActiveIndexing) {
      stopPolling();
      return;
    }

    startPolling(3000);

    return stopPolling;
  }, [agentId, hasActiveIndexing, startPolling, stopPolling]);

  const indexedCount = statuses.filter(
    (status) =>
      status.status === 'indexed' &&
      !status.sourceId.startsWith('__scope_run__:'),
  ).length;
  const indexingCount = statuses.filter(isIndexingStatus).length;

  return { statuses, indexedCount, indexingCount };
};
