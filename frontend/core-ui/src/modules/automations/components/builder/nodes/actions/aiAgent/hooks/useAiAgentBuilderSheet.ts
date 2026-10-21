import { aiAgentSheetStepAtom } from '@/automations/components/settings/components/agents/states/aiAgentStepState';
import { useSetAtom } from 'jotai';
import { useState } from 'react';

type TAiAgentBuilderSheet = { agentId?: string } | null;

/**
 * The agent editor opened over the builder instead of navigating away, so the
 * automation being edited keeps its unsaved state.
 */
export const useAiAgentBuilderSheet = ({
  onCreated,
}: {
  onCreated: (agentId: string) => void;
}) => {
  const [sheet, setSheet] = useState<TAiAgentBuilderSheet>(null);
  const [agentSelectOpen, setAgentSelectOpen] = useState(false);
  const setSheetStep = useSetAtom(aiAgentSheetStepAtom);

  const openSheet = (agentId?: string) => {
    setAgentSelectOpen(false);
    setSheetStep(null);
    setSheet({ agentId });
  };

  const closeSheet = () => setSheet(null);

  // Stay open on the saved agent and pick it for this action.
  const handleCreated = (agentId: string) => {
    setSheet({ agentId });
    onCreated(agentId);
  };

  return {
    sheet,
    openSheet,
    closeSheet,
    handleCreated,
    agentSelectOpen,
    setAgentSelectOpen,
  };
};
