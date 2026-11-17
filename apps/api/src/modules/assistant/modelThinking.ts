import { type AssistantProvider, AssistantThinkingLevel } from '@erxes/core-contract';
import {
  ASSISTANT_THINKING_LEVELS,
  type ASSISTANT_THINKING_KINDS,
} from '@erxes/core-db/assistantEnums';
import type { streamText } from 'ai';
import { findModelsDevModel } from './modelsDev';

type ThinkingKind = (typeof ASSISTANT_THINKING_KINDS)[number];

type ProviderOptions = NonNullable<Parameters<typeof streamText>[0]['providerOptions']>;

const LEGACY_LEVELS: readonly AssistantThinkingLevel[] = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
];

interface ResolvedThinking {
  kind: ThinkingKind;
  levels: AssistantThinkingLevel[];
  native: Partial<Record<AssistantThinkingLevel, string>>;
  min: number;
  max: number;
}

export const modelDisplayName = (provider: AssistantProvider, model: string) => {
  const name = findModelsDevModel(provider, model)?.name?.trim();

  return name && name.toLowerCase() !== model.trim().toLowerCase() ? name : null;
};

const BUDGET_SHARE: Partial<Record<AssistantThinkingLevel, number>> = {
  low: 0.25,
  medium: 0.5,
  high: 1,
};

const effortThinking = (values: string[]): ResolvedThinking | null => {
  const native: Partial<Record<AssistantThinkingLevel, string>> = {};

  for (const value of values) {
    const level = AssistantThinkingLevel.safeParse(value === 'none' ? 'off' : value);

    if (level.success) native[level.data] = value;
  }

  const levels = ASSISTANT_THINKING_LEVELS.filter((level) => level in native);

  return levels.length > 0 ? { kind: 'effort', levels, native, min: 0, max: 0 } : null;
};

const resolveThinking = (provider: AssistantProvider, model: string): ResolvedThinking | null => {
  const entry = findModelsDevModel(provider, model);

  if (!entry) return null;

  const none = { native: {}, min: 0, max: 0 };

  if (!entry.reasoning) return { ...none, kind: 'none', levels: [] };

  const options = entry.reasoning_options ?? [];
  const effort = options.find((option) => option.type === 'effort' && option.values);
  const fromEffort = effort?.values ? effortThinking(effort.values) : null;

  if (fromEffort) return fromEffort;

  const budget = options.find((option) => option.type === 'budget_tokens');

  if (budget) {
    const min = Math.max(0, budget.min ?? 0);
    const max = Math.max(min, budget.max ?? min);

    const levels: AssistantThinkingLevel[] =
      min === 0 ? ['off', 'low', 'medium', 'high'] : ['low', 'medium', 'high'];

    return { native: {}, kind: 'budget', levels, min, max };
  }

  if (options.some((option) => option.type === 'toggle')) {
    return { ...none, kind: 'toggle', levels: ['off', 'high'] };
  }

  return { ...none, kind: 'fixed', levels: [] };
};

export const modelThinking = (provider: AssistantProvider, model: string) => {
  const thinking = resolveThinking(provider, model);

  return thinking ? { kind: thinking.kind, levels: thinking.levels } : null;
};

const rank = (level: AssistantThinkingLevel) => ASSISTANT_THINKING_LEVELS.indexOf(level);

const clampLevel = (level: AssistantThinkingLevel, levels: readonly AssistantThinkingLevel[]) => {
  if (levels.length === 0 || levels.includes(level)) return level;

  return levels.reduce((best, candidate) => {
    const distance = Math.abs(rank(candidate) - rank(level));
    const bestDistance = Math.abs(rank(best) - rank(level));

    return distance < bestDistance || (distance === bestDistance && rank(candidate) > rank(best))
      ? candidate
      : best;
  });
};

const clampTo = (thinking: ResolvedThinking | null, level: AssistantThinkingLevel) =>
  clampLevel(level, thinking?.levels ?? LEGACY_LEVELS);

const OPENAI_EFFORT: Record<Exclude<AssistantThinkingLevel, 'off'>, string> = {
  minimal: 'minimal',
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'high',
  max: 'high',
};

const MIN_ANTHROPIC_THINKING_BUDGET = 1024;

const ANTHROPIC_BUDGET: Record<Exclude<AssistantThinkingLevel, 'off'>, number> = {
  minimal: MIN_ANTHROPIC_THINKING_BUDGET,
  low: 4000,
  medium: 10000,
  high: 16000,
  xhigh: 20000,
  max: 24000,
};

const KIMI_CODE_OUTPUT_CEILING = 32768;

const kimiCodeBudget = (thinking: ResolvedThinking | null, level: AssistantThinkingLevel) => {
  if (level === 'off' || thinking?.kind === 'none' || thinking?.kind === 'fixed') return 0;

  const budget =
    thinking?.kind === 'budget'
      ? Math.min(
          thinking.max,
          Math.max(thinking.min, Math.round(thinking.max * (BUDGET_SHARE[level] ?? 1))),
        )
      : ANTHROPIC_BUDGET[level];

  return Math.max(budget, MIN_ANTHROPIC_THINKING_BUDGET);
};

const anthropicThinking = (budgetTokens: number): ProviderOptions => ({
  anthropic: { thinking: { type: 'enabled', budgetTokens } },
});

export const shortAnswer = (
  provider: AssistantProvider,
  tokens: number,
): { maxOutputTokens: number; providerOptions?: ProviderOptions } =>
  provider === 'kimi-code'
    ? {
        maxOutputTokens: MIN_ANTHROPIC_THINKING_BUDGET + tokens,
        providerOptions: anthropicThinking(MIN_ANTHROPIC_THINKING_BUDGET),
      }
    : { maxOutputTokens: tokens };

const PROVIDER_OPTIONS_KEY: Record<AssistantProvider, string> = {
  openai: 'openai',
  grok: 'xai',
  kimi: 'kimi',
  'kimi-code': 'anthropic',
};

export const thinkingProviderOptions = (
  provider: AssistantProvider,
  model: string,
  level: AssistantThinkingLevel,
): ProviderOptions | undefined => {
  const thinking = resolveThinking(provider, model);
  const normalized = clampTo(thinking, level);

  if (provider === 'kimi-code') {
    const budget = kimiCodeBudget(thinking, normalized);

    return budget > 0 ? anthropicThinking(budget) : undefined;
  }

  if (!thinking) {
    return provider === 'openai' && normalized !== 'off'
      ? { openai: { reasoningEffort: OPENAI_EFFORT[normalized] } }
      : undefined;
  }

  const value = thinking.kind === 'effort' ? thinking.native[normalized] : undefined;

  if (value) return { [PROVIDER_OPTIONS_KEY[provider]]: { reasoningEffort: value } };

  if (thinking.kind === 'toggle' && provider === 'kimi') {
    return { kimi: { thinking: { type: normalized === 'off' ? 'disabled' : 'enabled' } } };
  }

  return undefined;
};

export const outputTokens = (
  provider: AssistantProvider,
  model: string,
  level: AssistantThinkingLevel,
  visible: number,
) => {
  if (provider !== 'kimi-code') return visible;

  const thinking = resolveThinking(provider, model);
  const budget = kimiCodeBudget(thinking, clampTo(thinking, level));

  return budget > 0 ? Math.min(visible + budget, KIMI_CODE_OUTPUT_CEILING) : visible;
};
