import {
  AI_AGENT_LEGACY_TABS,
  AI_AGENT_STEPS,
  TAiAgentStep,
} from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

const isAiAgentStep = (value: string | null): value is TAiAgentStep =>
  AI_AGENT_STEPS.includes(value as TAiAgentStep);

/**
 * Active step kept in `?tab=` so a step can be linked to. Without one, a saved
 * agent opens on memory (edited most) and a new one on connection (needed first).
 */
export const useAiAgentStep = ({ isEditing }: { isEditing: boolean }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab');
  const legacyStep = tab ? AI_AGENT_LEGACY_TABS[tab] : undefined;

  const step: TAiAgentStep = isAiAgentStep(tab)
    ? tab
    : legacyStep || (isEditing ? 'memory' : 'connection');

  const setStep = useCallback(
    (next: TAiAgentStep) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set('tab', next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { step, setStep };
};
