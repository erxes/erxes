import { TAiAgentModelOption } from '@/automations/components/settings/components/agents/hooks/useAiAgentModelOptions';

/** "openai/gpt-x" as "OPENAI / GPT-X". */
export const formatModelLabel = (model: string) =>
  model
    .split('/')
    .map((part) => part.toUpperCase())
    .join(' / ');

export type TAiAgentModelHint =
  | { kind: 'unverified' }
  | {
      kind: 'retired';
      messageKey: string;
      tone: 'text-destructive' | 'text-warning';
      suggestion?: string;
    };

/** What to say under a chosen model that may not work, if anything. */
export const modelHintOf = (
  option?: TAiAgentModelOption,
): TAiAgentModelHint | null => {
  if (!option) {
    return null;
  }

  if (option.status === 'unverified') {
    return { kind: 'unverified' };
  }

  if (option.status !== 'deprecated' && option.status !== 'unavailable') {
    return null;
  }

  return {
    kind: 'retired',
    messageKey: `settings-model-${option.status}-hint`,
    tone: option.status === 'unavailable' ? 'text-destructive' : 'text-warning',
    suggestion: option.suggestion || undefined,
  };
};
