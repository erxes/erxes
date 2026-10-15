import { AI_AGENT_STEPS } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { AI_AGENT_PROVIDER_LABELS } from '@/automations/components/settings/components/agents/constants/providers';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { useAiAgentMemoryItems } from '@/automations/components/settings/components/agents/hooks/useAiAgentMemoryItems';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { useAiAgentBotScene } from '@/automations/components/settings/components/agents/hooks/useAiAgentBotScene';
import { resolveAiAgentBotScene } from '@/automations/components/settings/components/agents/utils/aiAgentBotPose';
import { useFormContext, useWatch } from 'react-hook-form';

/** What the profile bar says about the agent: its face, status line and memory. */
export const useAiAgentProfile = () => {
  const { step, states, headline, asleep, knowledgeStatuses } =
    useAiAgentDetailContext();
  const { control } = useFormContext<TAiAgentForm>();
  const [name, connection, systemPrompt, knowledgeSources] = useWatch({
    control,
    name: [
      'name',
      'connection',
      'context.systemPrompt',
      'context.knowledgeSources',
    ],
  });
  const { items } = useAiAgentMemoryItems({
    knowledgeSources: knowledgeSources || [],
    knowledgeStatuses,
  });

  const memoryChips = items.filter((item) => {
    if (item.kind === 'instructions') {
      return !!systemPrompt?.trim();
    }

    if (item.kind === 'source') {
      return item.meta !== '0';
    }

    return item.kind === 'file';
  });

  const isHealthy = headline.status === 'done' || headline.status === 'pending';
  const summary = isHealthy
    ? [
        connection?.model,
        AI_AGENT_PROVIDER_LABELS[connection?.provider],
        `${memoryChips.length} memory item${
          memoryChips.length === 1 ? '' : 's'
        }`,
      ]
        .filter(Boolean)
        .join(' · ')
    : states[headline.step].detail || states[headline.step].message || '';

  const pose = useAiAgentBotScene(
    resolveAiAgentBotScene({ step, state: states[step], asleep }),
  );
  const missingParts = AI_AGENT_STEPS.filter(
    (current) => states[current].status === 'missing',
  );

  return {
    name: name?.trim() || 'Untitled agent',
    pose,
    missingParts,
    summary,
    memoryChips,
  };
};
