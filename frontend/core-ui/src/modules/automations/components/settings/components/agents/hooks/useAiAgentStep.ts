import {
  AI_AGENT_LEGACY_TABS,
  AI_AGENT_STEPS,
  TAiAgentStep,
} from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { aiAgentSheetStepAtom } from '@/automations/components/settings/components/agents/states/aiAgentStepState';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

const isAiAgentStep = (value: string | null): value is TAiAgentStep =>
  AI_AGENT_STEPS.includes(value as TAiAgentStep);

/**
 * Active step. On the agent route it lives in `?tab=` so a step can be linked
 * to; elsewhere (the builder) it lives in an atom. Without one, a saved agent
 * opens on memory (edited most) and a new one on connection (needed first).
 */
export const useAiAgentStep = ({
  isEditing,
  persistStepInUrl,
}: {
  isEditing: boolean;
  persistStepInUrl: boolean;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetStep, setSheetStep] = useAtom(aiAgentSheetStepAtom);
  const tab = persistStepInUrl ? searchParams.get('tab') : sheetStep;
  const legacyStep = tab ? AI_AGENT_LEGACY_TABS[tab] : undefined;

  const step: TAiAgentStep = isAiAgentStep(tab)
    ? tab
    : legacyStep || (isEditing ? 'memory' : 'connection');

  const setStep = useCallback(
    (next: TAiAgentStep) => {
      if (!persistStepInUrl) {
        setSheetStep(next);
        return;
      }

      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set('tab', next);
          return params;
        },
        { replace: true },
      );
    },
    [persistStepInUrl, setSearchParams, setSheetStep],
  );

  return { step, setStep };
};
