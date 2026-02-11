import { useQuery } from '@apollo/client';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { AutomationAiAgentProgressSection } from '@/automations/components/settings/components/agents/components/form/AutomationAiAgentProgressSection';
import { AutomationAiAgentTestChatSection } from '@/automations/components/settings/components/agents/components/form/AutomationAiAgentTestChatSection';
import { GET_TRAINING_STATUS } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { TAiAgentTrainingStatusQueryResponse } from '@/automations/components/settings/components/agents/types/automationAiAgentForm';
import { automationAiAgentIsStartedTrainingState } from '@/automations/states/automationState';

export const AutomationAiAgentTrainingWrapper = ({
  agentId,
}: {
  agentId: string;
}) => {
  const [isStartedTraining, setIsTraining] = useAtom(
    automationAiAgentIsStartedTrainingState,
  );

  const { data: trainingStatus } =
    useQuery<TAiAgentTrainingStatusQueryResponse>(GET_TRAINING_STATUS, {
      variables: { agentId },
      skip: !agentId,
      pollInterval: isStartedTraining ? 2000 : 0, // Poll every 2 seconds when training
    });

  // Monitor training progress
  useEffect(() => {
    if (trainingStatus?.getTrainingStatus?.status === 'completed') {
      setIsTraining(false);
    } else if (trainingStatus?.getTrainingStatus?.status === 'failed') {
      setIsTraining(false);
    }
  }, [trainingStatus]);

  return (
    <>
      <AutomationAiAgentProgressSection
        agentId={agentId}
        trainingStatus={trainingStatus?.getTrainingStatus}
      />
      <AutomationAiAgentTestChatSection
        trainingStatus={trainingStatus?.getTrainingStatus?.status}
      />
    </>
  );
};
