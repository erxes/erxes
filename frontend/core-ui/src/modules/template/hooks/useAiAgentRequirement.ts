import { useAiAgents } from '@/automations/components/settings/components/agents/hooks/useAiAgents';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TEMPLATE_REQUIREMENT_CARD_LIMIT,
  useTemplateRequirementOptions,
} from 'ui-modules';

/** Picks an agent, or creates one in place and picks it, and names it. */
export const useAiAgentRequirement = (
  value: unknown,
  onChange: (value: unknown) => void,
  onLabel: (label: string | null) => void,
) => {
  const { automationsAiAgents, loading } = useAiAgents();
  const [isCreating, setCreating] = useState(false);
  const agentId = typeof value === 'string' ? value : '';
  const name =
    automationsAiAgents.find(({ _id }) => _id === agentId)?.name || null;

  const select = useCallback(
    (next?: string) => onChange(next || null),
    [onChange],
  );
  const options = useMemo(
    () =>
      automationsAiAgents.map((agent) => ({
        value: agent._id,
        label: agent.name || '',
        // The connection is what the template's agent borrows
        description:
          [agent.connection?.provider, agent.connection?.model]
            .filter(Boolean)
            .join(' · ') || undefined,
      })),
    [automationsAiAgents],
  );

  useTemplateRequirementOptions({
    ids: options.map((option) => option.value),
    value: agentId,
    loading,
    onSelect: select,
  });

  useEffect(() => {
    if (!loading) {
      onLabel(name);
    }
  }, [loading, name, onLabel]);

  return {
    agentId,
    options,
    loading,
    showCards: options.length <= TEMPLATE_REQUIREMENT_CARD_LIMIT,
    select,
    isCreating,
    openCreate: () => setCreating(true),
    closeCreate: () => setCreating(false),
    handleCreated: (createdId: string) => {
      setCreating(false);
      select(createdId);
    },
  };
};
