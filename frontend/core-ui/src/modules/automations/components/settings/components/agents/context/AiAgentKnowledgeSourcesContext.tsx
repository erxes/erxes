import { TAiAgentKnowledgeSourceSelections } from '@/automations/components/settings/components/agents/utils/aiAgentKnowledgeSources';
import { createContext, useContext } from 'react';
import {
  TAiKnowledgeSourceConfig,
  TAiKnowledgeSourceIndexStatus,
} from 'ui-modules';

export type TAiAgentKnowledgeSourcesContext = {
  knowledgeSources: TAiAgentKnowledgeSourceSelections;
  statuses: TAiKnowledgeSourceIndexStatus[];
  handleSourceIdsChange: (
    source: TAiKnowledgeSourceConfig,
    sourceIds: string[],
    config?: Record<string, unknown>,
  ) => void;
  handleSourceEnabledChange: (
    source: TAiKnowledgeSourceConfig,
    enabled: boolean,
  ) => void;
};

const AiAgentKnowledgeSourcesContext =
  createContext<TAiAgentKnowledgeSourcesContext | null>(null);

export const AiAgentKnowledgeSourcesProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TAiAgentKnowledgeSourcesContext;
}) => {
  return (
    <AiAgentKnowledgeSourcesContext.Provider value={value}>
      {children}
    </AiAgentKnowledgeSourcesContext.Provider>
  );
};

export const useAiAgentKnowledgeSources = () => {
  const context = useContext(AiAgentKnowledgeSourcesContext);

  if (!context) {
    throw new Error(
      'useAiAgentKnowledgeSources must be used within an AiAgentKnowledgeSourcesProvider',
    );
  }

  return context;
};
