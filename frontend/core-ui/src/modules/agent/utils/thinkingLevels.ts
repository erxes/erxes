import type { IAgentsModelThinkingKind } from '../graphql/connection';
import type { IAgentsThinkingLevel } from '../hooks/useAgentsChat';

/** Every level the chat can request, shallowest first (mirrors the backend). */
export const THINKING_LEVELS: readonly IAgentsThinkingLevel[] = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
  'max',
];

/** Levels offered for models without catalog data, as before. */
export const LEGACY_THINKING_LEVELS: readonly IAgentsThinkingLevel[] = [
  'off',
  'minimal',
  'low',
  'medium',
  'high',
];

/** A model's thinking control, normalized from `agentsModels`. */
export interface IAgentsModelThinking {
  kind: IAgentsModelThinkingKind;
  levels: IAgentsThinkingLevel[];
}

const THINKING_KINDS: readonly IAgentsModelThinkingKind[] = [
  'effort',
  'toggle',
  'budget',
  'fixed',
  'none',
];

export const isAgentsThinkingLevel = (
  value: unknown,
): value is IAgentsThinkingLevel =>
  typeof value === 'string' &&
  (THINKING_LEVELS as readonly string[]).includes(value);

/** Validates server data; anything unrecognised means "no catalog data". */
export const toModelThinking = (
  data:
    | { kind?: string | null; levels?: (string | null)[] | null }
    | null
    | undefined,
): IAgentsModelThinking | null => {
  const kind = THINKING_KINDS.find((candidate) => candidate === data?.kind);

  if (!kind) {
    return null;
  }

  return {
    kind,
    levels: THINKING_LEVELS.filter((level) =>
      (data?.levels ?? []).includes(level),
    ),
  };
};

/** Levels to offer: the model's own, or the original five when unknown. */
export const thinkingLevelsFor = (
  thinking: IAgentsModelThinking | null,
): readonly IAgentsThinkingLevel[] =>
  thinking?.levels ?? LEGACY_THINKING_LEVELS;

/**
 * Nearest supported level by depth, preferring the deeper one on ties (same
 * rule as the backend). Without a level choice the level is kept as is.
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

/**
 * Thinking control of the model a turn runs on: the explicit selection, or
 * the server default connection when none is selected. Null when the model is
 * not in the catalog (the original five levels apply).
 */
export const findModelThinking = (
  providerModels: readonly {
    provider: string;
    models: readonly { id: string; thinking?: IAgentsModelThinking | null }[];
  }[],
  choice: { provider: string; model: string } | undefined,
): IAgentsModelThinking | null =>
  (choice &&
    providerModels
      .find((group) => group.provider === choice.provider)
      ?.models.find((model) => model.id === choice.model)?.thinking) ??
  null;
