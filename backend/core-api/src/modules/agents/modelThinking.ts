import type { ProviderOptions } from '@mastra/core/llm/model/provider-options' with {
  'resolution-mode': 'import',
};
import snapshot from '@/agents/data/modelsDevSnapshot.json';

/**
 * Display names and thinking controls per model, from the bundled models.dev
 * snapshot (`data/modelsDevSnapshot.json`, refreshed by
 * `data/refreshModelsDevSnapshot.mjs`; never fetched at runtime). A model the
 * snapshot does not know keeps the original five levels and their original
 * per-provider mapping.
 */

/** Thinking depth the chat can request, shallowest first. */
export type IAgentsThinkingLevel =
  | 'off'
  | 'minimal'
  | 'low'
  | 'medium'
  | 'high'
  | 'xhigh'
  | 'max';

export const THINKING_LEVELS: readonly IAgentsThinkingLevel[] = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
];

/** The levels offered before per-model data existed; unknown models keep them. */
export const LEGACY_THINKING_LEVELS: readonly IAgentsThinkingLevel[] = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
];

export const isAgentsThinkingLevel = (
  value: unknown,
): value is IAgentsThinkingLevel =>
  typeof value === 'string' &&
  (THINKING_LEVELS as readonly string[]).includes(value);

/**
 * How a model exposes thinking: an effort scale, an on/off toggle, a token
 * budget, always-on reasoning without a control (`fixed`), or none.
 */
export type IAgentsThinkingKind =
  | 'effort'
  | 'toggle'
  | 'budget'
  | 'fixed'
  | 'none';

/** Public per-model thinking contract (GraphQL `AgentsModelThinking`). */
export interface IAgentsModelThinking {
  kind: IAgentsThinkingKind;
  /** Selectable levels, shallowest first; empty for `fixed` and `none`. */
  levels: IAgentsThinkingLevel[];
}

interface IModelsDevReasoningOption {
  type: string;
  values?: string[];
  min?: number;
  max?: number;
}

interface IModelsDevModel {
  id: string;
  name?: string;
  reasoning: boolean;
  reasoning_options?: IModelsDevReasoningOption[];
}

interface IModelsDevSnapshot {
  providers: Record<
    string,
    { modelsDevProvider: string; models: Record<string, IModelsDevModel> }
  >;
}

interface IResolvedThinking extends IAgentsModelThinking {
  /** effort: our level → the provider's native value. */
  native: Partial<Record<IAgentsThinkingLevel, string>>;
  /** budget: inclusive token range. */
  min: number;
  max: number;
}

const SNAPSHOT = snapshot as IModelsDevSnapshot;

/** The bundled models.dev entry for one of our provider/model pairs. */
const findModelsDevModel = (
  provider: string,
  model: string,
): IModelsDevModel | undefined =>
  SNAPSHOT.providers[provider]?.models[model.trim()];

/**
 * The human name for a model, or null when the snapshot has none or its name
 * only repeats the id, ignoring case (`gpt-5.6` → "GPT-5.6",
 * `kimi-for-coding` → "kimi-for-coding"). "GPT-6 Luna" for `gpt-6-luna` is a
 * real name.
 */
export const getModelDisplayName = (
  provider: string,
  model: string,
): string | null => {
  const name = findModelsDevModel(provider, model)?.name?.trim();

  return name && name.toLowerCase() !== model.trim().toLowerCase()
    ? name
    : null;
};

/** Budget levels map to a share of the model's maximum budget. */
const BUDGET_SHARE: Partial<Record<IAgentsThinkingLevel, number>> = {
  low: 0.25,
  medium: 0.5,
  high: 1,
};

const resolveThinking = (
  provider: string,
  model: string,
): IResolvedThinking | null => {
  const entry = findModelsDevModel(provider, model);

  if (!entry) {
    return null;
  }

  const base = { native: {}, min: 0, max: 0 };

  if (!entry.reasoning) {
    return { ...base, kind: 'none', levels: [] };
  }

  const options = entry.reasoning_options ?? [];
  const effort = options.find(
    (option) => option.type === 'effort' && Array.isArray(option.values),
  );

  if (effort) {
    const native: Partial<Record<IAgentsThinkingLevel, string>> = {};

    for (const value of effort.values ?? []) {
      const level = value === 'none' ? 'off' : value;

      if (isAgentsThinkingLevel(level)) {
        native[level] = value;
      }
    }

    const levels = THINKING_LEVELS.filter((level) => level in native);

    if (levels.length > 0) {
      return { ...base, kind: 'effort', levels, native };
    }
  }

  const budget = options.find((option) => option.type === 'budget_tokens');

  if (budget) {
    const min = Math.max(0, budget.min ?? 0);
    const max = Math.max(min, budget.max ?? min);

    return {
      ...base,
      kind: 'budget',
      levels: [
        ...(min === 0 ? (['off'] as const) : []),
        'low',
        'medium',
        'high',
      ],
      min,
      max,
    };
  }

  if (options.some((option) => option.type === 'toggle')) {
    // "On" is represented by `high`, so the default level needs no change.
    return { ...base, kind: 'toggle', levels: ['off', 'high'] };
  }

  return { ...base, kind: 'fixed', levels: [] };
};

/** Thinking control for a model, or null for models the snapshot lacks. */
export const getModelThinking = (
  provider: string,
  model: string,
): IAgentsModelThinking | null => {
  const thinking = resolveThinking(provider, model);

  return thinking ? { kind: thinking.kind, levels: thinking.levels } : null;
};

/**
 * Nearest supported level by depth; ties go to the deeper level. An empty
 * list (no control) leaves the level unchanged.
 */
export const clampThinkingLevel = (
  level: IAgentsThinkingLevel,
  levels: readonly IAgentsThinkingLevel[],
): IAgentsThinkingLevel => {
  if (levels.length === 0 || levels.includes(level)) {
    return level;
  }

  const rank = THINKING_LEVELS.indexOf(level);

  return levels.reduce((best, candidate) => {
    const distance = Math.abs(THINKING_LEVELS.indexOf(candidate) - rank);
    const bestDistance = Math.abs(THINKING_LEVELS.indexOf(best) - rank);

    return distance < bestDistance ||
      (distance === bestDistance &&
        THINKING_LEVELS.indexOf(candidate) > THINKING_LEVELS.indexOf(best))
      ? candidate
      : best;
  });
};

const clampTo = (
  thinking: IResolvedThinking | null,
  level: IAgentsThinkingLevel,
): IAgentsThinkingLevel =>
  clampThinkingLevel(level, thinking?.levels ?? LEGACY_THINKING_LEVELS);

/**
 * Server-side validation of a requested level: it is clamped to what the
 * model supports; models the snapshot lacks are clamped to the legacy five.
 */
export const normalizeThinkingLevel = (
  provider: string,
  model: string,
  level: IAgentsThinkingLevel,
): IAgentsThinkingLevel => clampTo(resolveThinking(provider, model), level);

// ── Provider translation ────────────────────────────────────────────────

type ILegacyLevel = Exclude<IAgentsThinkingLevel, 'off'>;

/** Legacy OpenAI mapping for models the snapshot lacks. */
const OPENAI_REASONING_EFFORT: Record<ILegacyLevel, string> = {
  minimal: 'minimal',
  low: 'low',
  medium: 'medium',
  high: 'high',
  xhigh: 'high',
  max: 'high',
};

/**
 * Smallest Anthropic-protocol `budget_tokens` (Anthropic documents 1,024 as
 * the minimum). The minimal level and the model check both use it.
 */
export const MIN_ANTHROPIC_THINKING_BUDGET = 1024;

/**
 * Anthropic-protocol (kimi-code) thinking budgets. Kimi Code takes thinking
 * as `budget_tokens`; deeper levels keep growing but stay inside the output
 * ceiling below.
 */
const ANTHROPIC_THINKING_BUDGET: Record<ILegacyLevel, number> = {
  minimal: MIN_ANTHROPIC_THINKING_BUDGET,
  low: 4000,
  medium: 10000,
  high: 16000,
  xhigh: 20000,
  max: 24000,
};

/** Smallest Kimi Code output limit (kimi-for-coding, models.dev). */
const KIMI_CODE_OUTPUT_CEILING = 32768;

const anthropicThinking = (budget: number): ProviderOptions => ({
  anthropic: { thinking: { type: 'enabled', budgetTokens: budget } },
});

/** kimi-code thinking budget for a normalized level (0 = no thinking). */
const kimiCodeBudget = (
  thinking: IResolvedThinking | null,
  level: IAgentsThinkingLevel,
): number => {
  if (level === 'off' || thinking?.kind === 'none' || thinking?.kind === 'fixed') {
    return 0;
  }

  const budget =
    thinking?.kind === 'budget'
      ? Math.min(
          thinking.max,
          Math.max(
            thinking.min,
            Math.round(thinking.max * (BUDGET_SHARE[level] ?? 1)),
          ),
        )
      : ANTHROPIC_THINKING_BUDGET[level];

  return Math.max(budget, MIN_ANTHROPIC_THINKING_BUDGET);
};

/**
 * Maps a normalized thinking level to the provider's native options, through
 * the client `providers.ts` builds:
 * - openai (native Responses client): `reasoning.effort`, including `none`;
 * - grok / kimi (OpenAI-compatible client): `reasoning_effort` under the
 *   provider's own options key — the client ignores other keys — and Kimi's
 *   `thinking: { type }` for toggle models;
 * - kimi-code (Anthropic Messages): `thinking.budget_tokens`.
 * Models the snapshot lacks keep the original mapping: OpenAI effort and
 * kimi-code budgets, nothing for grok and kimi.
 */
export const buildThinkingProviderOptions = (
  provider: string,
  model: string,
  level: IAgentsThinkingLevel,
): ProviderOptions | undefined => {
  const thinking = resolveThinking(provider, model);
  const normalized = clampTo(thinking, level);

  if (provider === 'kimi-code') {
    const budget = kimiCodeBudget(thinking, normalized);

    return budget > 0 ? anthropicThinking(budget) : undefined;
  }

  if (!thinking) {
    return provider === 'openai' && normalized !== 'off'
      ? { openai: { reasoningEffort: OPENAI_REASONING_EFFORT[normalized] } }
      : undefined;
  }

  if (thinking.kind === 'effort') {
    const value = thinking.native[normalized];

    return value ? { [provider]: { reasoningEffort: value } } : undefined;
  }

  if (thinking.kind === 'toggle' && provider === 'kimi') {
    return {
      kimi: { thinking: { type: normalized === 'off' ? 'disabled' : 'enabled' } },
    };
  }

  return undefined;
};

/**
 * Output allowance for a stream call. kimi-code adds its thinking budget so
 * reasoning never starves the visible answer, capped at the Kimi Code output
 * ceiling.
 */
export const thinkingOutputTokens = (
  provider: string,
  model: string | undefined,
  level: IAgentsThinkingLevel,
  visibleTokens: number,
): number => {
  if (provider !== 'kimi-code') {
    return visibleTokens;
  }

  const thinking = model ? resolveThinking(provider, model) : null;
  const budget = kimiCodeBudget(thinking, clampTo(thinking, level));

  return budget > 0
    ? Math.min(visibleTokens + budget, KIMI_CODE_OUTPUT_CEILING)
    : visibleTokens;
};
