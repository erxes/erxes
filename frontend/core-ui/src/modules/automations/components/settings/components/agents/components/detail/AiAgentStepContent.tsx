import { AiAgentBrainStep } from '@/automations/components/settings/components/agents/components/detail/steps/AiAgentBrainStep';
import { AiAgentConnectionStep } from '@/automations/components/settings/components/agents/components/detail/steps/AiAgentConnectionStep';
import { AiAgentIdentityStep } from '@/automations/components/settings/components/agents/components/detail/steps/AiAgentIdentityStep';
import { AiAgentMemoryStep } from '@/automations/components/settings/components/agents/components/detail/steps/AiAgentMemoryStep';
import { AiAgentTestStep } from '@/automations/components/settings/components/agents/components/detail/steps/AiAgentTestStep';
import { TAiAgentStep } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { cn } from 'erxes-ui';
import { ComponentType } from 'react';

const STEP_COMPONENTS: Record<TAiAgentStep, ComponentType> = {
  identity: AiAgentIdentityStep,
  connection: AiAgentConnectionStep,
  brain: AiAgentBrainStep,
  memory: AiAgentMemoryStep,
  test: AiAgentTestStep,
};

export const AiAgentStepContent = () => {
  const { step } = useAiAgentDetailContext();
  const StepComponent = STEP_COMPONENTS[step];

  // Memory scrolls its own list and editor; other steps scroll as a page.
  return (
    <div
      className={cn(
        'min-h-0 flex-1 px-5 py-4',
        step === 'memory' ? 'overflow-hidden' : 'overflow-y-auto',
      )}
    >
      <StepComponent />
    </div>
  );
};
