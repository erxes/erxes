import { START_AI_TRAINING } from '@/automations/components/settings/components/agents/graphql/automationsAiAgents';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { automationAiAgentIsStartedTrainingState } from '@/automations/states/automationState';
import { useMutation } from '@apollo/client';
import { useAtom, useSetAtom } from 'jotai';
import { useFormContext, useWatch } from 'react-hook-form';

export const useAiAgentTrainingProcess = (agentId?: string) => {
  const [isStartedTraining, setIsTraining] = useAtom(
    automationAiAgentIsStartedTrainingState,
  );
  const { control } = useFormContext<TAiAgentForm>();
  const files = useWatch<TAiAgentForm>({ name: 'files', control });

  const [startTraining] = useMutation(START_AI_TRAINING, {
    onCompleted: () => {
      setIsTraining(true);
    },
    onError: (error) => {
      console.error('Training failed:', error);
      setIsTraining(false);
    },
  });

  const handleStartTraining = async () => {
    if (!agentId) return;

    try {
      setIsTraining(true);
      await startTraining({ variables: { agentId } });
    } catch (error) {
      console.error('Failed to start training:', error);
      setIsTraining(false);
    }
  };

  return {
    isFilesExists: !!files?.length,
    isStartedTraining,
    handleStartTraining,
  };
};
