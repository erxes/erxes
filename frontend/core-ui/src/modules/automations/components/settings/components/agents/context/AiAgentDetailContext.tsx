import { TAiAgentStep } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { TAiAgentHealthState } from '@/automations/components/settings/components/agents/hooks/useAiAgentHealth';
import { TAiAgentFormDetail } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  TAiAgentHeadline,
  TAiAgentStepStates,
} from '@/automations/components/settings/components/agents/utils/aiAgentStepStatuses';
import { createContext, ReactNode, useContext } from 'react';
import { TAiKnowledgeSourceIndexStatus } from 'ui-modules';

export type TAiAgentDetailContext = {
  detail?: TAiAgentFormDetail;
  isEditing: boolean;
  step: TAiAgentStep;
  setStep: (step: TAiAgentStep) => void;
  states: TAiAgentStepStates;
  headline: TAiAgentHeadline;
  asleep: boolean;
  health: TAiAgentHealthState;
  knowledgeStatuses: TAiKnowledgeSourceIndexStatus[];
  memoryKey: string;
  openMemory: (key: string) => void;
  save: () => void;
  requestClose: () => void;
};

const AiAgentDetailContext = createContext<TAiAgentDetailContext | null>(null);

export const AiAgentDetailProvider = ({
  value,
  children,
}: {
  value: TAiAgentDetailContext;
  children: ReactNode;
}) => (
  <AiAgentDetailContext.Provider value={value}>
    {children}
  </AiAgentDetailContext.Provider>
);

export const useAiAgentDetailContext = () => {
  const context = useContext(AiAgentDetailContext);

  if (!context) {
    throw new Error(
      'useAiAgentDetailContext must be used within an AiAgentDetailProvider',
    );
  }

  return context;
};
