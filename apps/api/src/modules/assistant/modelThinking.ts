import { type AssistantThinkingLevel, type AssistantProvider } from '@erxes/core-contract';
import {
  ASSISTANT_THINKING_LEVELS,
  type ASSISTANT_THINKING_KINDS,
} from '@erxes/core-db/assistantEnums';
import { findModelsDevModel } from './modelsDev';

type ThinkingKind = (typeof ASSISTANT_THINKING_KINDS)[number];

interface Thinking {
  kind: ThinkingKind;
  levels: AssistantThinkingLevel[];
}

export const modelDisplayName = (provider: AssistantProvider, model: string) => {
  const name = findModelsDevModel(provider, model)?.name?.trim();

  return name && name.toLowerCase() !== model.trim().toLowerCase() ? name : null;
};

const effortThinking = (values: string[]): Thinking | null => {
  const named = new Set(values.map((value) => (value === 'none' ? 'off' : value)));
  const levels = ASSISTANT_THINKING_LEVELS.filter((level) => named.has(level));

  return levels.length > 0 ? { kind: 'effort', levels } : null;
};

/** How a model thinks and the levels the member can pick, from models.dev. */
export const modelThinking = (provider: AssistantProvider, model: string): Thinking | null => {
  const entry = findModelsDevModel(provider, model);

  if (!entry) return null;

  if (!entry.reasoning) return { kind: 'none', levels: [] };

  const options = entry.reasoning_options ?? [];
  const effort = options.find((option) => option.type === 'effort' && option.values);
  const fromEffort = effort?.values ? effortThinking(effort.values) : null;

  if (fromEffort) return fromEffort;

  const budget = options.find((option) => option.type === 'budget_tokens');

  if (budget) {
    return {
      kind: 'budget',
      levels: (budget.min ?? 0) <= 0 ? ['off', 'low', 'medium', 'high'] : ['low', 'medium', 'high'],
    };
  }

  if (options.some((option) => option.type === 'toggle')) {
    return { kind: 'toggle', levels: ['off', 'high'] };
  }

  return { kind: 'fixed', levels: [] };
};
