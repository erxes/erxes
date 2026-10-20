import { AI_AGENT_INSTRUCTIONS_KEY } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { TAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { useAiAgentHealth } from '@/automations/components/settings/components/agents/hooks/useAiAgentHealth';
import { useAiAgentKnowledgeSourceStatuses } from '@/automations/components/settings/components/agents/hooks/useAiAgentKnowledgeSourceStatuses';
import { useAiAgentStep } from '@/automations/components/settings/components/agents/hooks/useAiAgentStep';
import {
  TAiAgentForm,
  TAiAgentFormDetail,
} from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import {
  getAiAgentHeadline,
  getAiAgentStepStates,
} from '@/automations/components/settings/components/agents/utils/aiAgentStepStatuses';
import { useConfirm } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export const useAiAgentDetailState = ({
  detail,
  save,
  close,
  persistStepInUrl,
}: {
  detail?: TAiAgentFormDetail;
  save: () => void;
  close: () => void;
  persistStepInUrl: boolean;
}): TAiAgentDetailContext => {
  const isEditing = !!detail?._id;
  const {
    control,
    formState: { isDirty, dirtyFields },
  } = useFormContext<TAiAgentForm>();
  const connectionDirty = Object.keys(dirtyFields.connection || {}).some(
    (key) => key !== 'model',
  );
  const brainDirty = !!dirtyFields.connection?.model || !!dirtyFields.runtime;
  const untouched = useMemo(
    () => ({ connection: !connectionDirty, brain: !brainDirty }),
    [connectionDirty, brainDirty],
  );
  const values = useWatch({ control });
  const { confirm } = useConfirm();
  const { step, setStep } = useAiAgentStep({ isEditing, persistStepInUrl });
  const health = useAiAgentHealth(detail?._id);
  const { statuses: knowledgeStatuses } = useAiAgentKnowledgeSourceStatuses(
    detail?._id,
  );
  const [memoryKey, setMemoryKey] = useState(AI_AGENT_INSTRUCTIONS_KEY);

  const states = useMemo(
    () =>
      getAiAgentStepStates({
        values,
        isEditing,
        usageTotal: detail?.usage?.total,
        hasStoredApiKey: !!detail?.connection?.config?.apiKey,
        health: health.health,
        healthLoading: health.loading,
        knowledgeStatuses,
        untouched,
      }),
    [
      values,
      isEditing,
      detail,
      health.health,
      health.loading,
      knowledgeStatuses,
      untouched,
    ],
  );
  const headline = useMemo(() => getAiAgentHeadline(states), [states]);

  const openMemory = (key: string) => {
    setMemoryKey(key);
    setStep('memory');
  };

  const requestClose = () => {
    if (!isDirty) {
      close();
      return;
    }

    confirm({
      message: 'Discard unsaved changes?',
      options: {
        description: 'Your edits to this agent have not been saved yet.',
        okLabel: 'Discard',
      },
    }).then(close);
  };

  return {
    detail,
    isEditing,
    step,
    setStep,
    states,
    headline,
    asleep:
      states.connection.status === 'missing' ||
      states.brain.status === 'missing',
    health,
    knowledgeStatuses,
    memoryKey,
    openMemory,
    save,
    requestClose,
  };
};
