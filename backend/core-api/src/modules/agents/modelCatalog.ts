import {
  findModelsDevModel,
  listModelsDevModels,
} from '@/agents/modelsDevSnapshot';

/**
 * Turns a provider's raw `/models` listing into the models this agent can
 * actually run: chat-capable, tool-calling text models reachable through the
 * client `providers.ts` builds for that provider (OpenAI's native Responses
 * client; OpenAI-compatible Chat Completions for grok/kimi; the Anthropic
 * Messages protocol for kimi-code).
 *
 * Model knowledge has one source, the bundled models.dev snapshot
 * (`modelsDevSnapshot.ts`): it decides usability for every model it knows and
 * supplies Kimi Code's fixed catalog. The id patterns below are the explicit
 * fallback for ids the snapshot lacks and the ranking heuristic; nothing here
 * lists model names.
 */

/** One raw entry from a provider's `/models` endpoint. */
export interface IProviderModelEntry {
  id: string;
  /** Unix seconds when the provider reports it; used only to break ties. */
  created?: number;
}

/** One usable model, as exposed to the picker. */
export interface IAgentsModelInfo {
  id: string;
  /** Generation line, e.g. `gpt-5.6`, `grok-4`, `kimi-k3`; '' when unknown. */
  family: string;
  /** Part of the provider's short list shown before searching. */
  recommended: boolean;
}

interface IProviderCatalogRules {
  /** Ids this provider lists that cannot serve as a tool-calling chat model. */
  deny: RegExp[];
  /**
   * Generation lines, most preferred first. The first capture group is the
   * major version and the optional second one the minor version.
   */
  families: RegExp[];
  /** Usable but slow, costly or superseded variants kept off the short list. */
  notRecommended: RegExp[];
}

/** Maximum number of recommended models per provider. */
export const RECOMMENDED_MODEL_LIMIT = 4;

/** Non-chat modalities every provider may list next to its chat models. */
const NON_CHAT_MODELS: RegExp[] = [
  /embed/,
  /(^|-)tts(-|$)/,
  /whisper/,
  /transcri/,
  /(^|-)audio(-|$)/,
  /realtime/,
  /(^|-)image(-|$)/,
  /imagine/,
  /dall-e/,
  /moderation/,
  /(^|-)video(-|$)/,
  /sora/,
  /speech/,
  /rerank/,
  /(^|-)search(-|$)/,
];

const KIMI_FAMILY = /^kimi-k(\d+)(?:\.(\d+))?(?=-|$)/;

const PROVIDER_CATALOG_RULES: Record<string, IProviderCatalogRules> = {
  openai: {
    deny: [
      ...NON_CHAT_MODELS,
      // Legacy completion models and the 8k/turbo GPT-4 line.
      /^(babbage|davinci|curie|ada)(-|$)/,
      /instruct/,
      /^gpt-3\.5/,
      /^gpt-4(?![o.])/,
      // Chat-tuned aliases and early reasoning previews lack function calling.
      /^chatgpt-/,
      /chat-latest/,
      /^o1-(mini|preview)/,
      // Agentic tool-specific models: coding harness, computer use, research.
      /codex/,
      /computer-use/,
      /deep-research/,
      /(^|-)oss(-|$)/,
    ],
    families: [/^gpt-(\d+)(?:\.(\d+))?o?(?=-|$)/, /^o(\d+)(?=-|$)/],
    notRecommended: [/-pro(-|$)/, /preview/],
  },
  grok: {
    deny: NON_CHAT_MODELS,
    // xAI writes minor versions both as `grok-4.5` and `grok-4-1-fast`.
    families: [/^grok-(\d+)(?:[.-](\d)(?=-|$))?(?=-|$)/],
    notRecommended: [/-non-reasoning$/, /beta/],
  },
  kimi: {
    deny: [
      ...NON_CHAT_MODELS,
      // The thinking preview does not accept tool definitions.
      /^kimi-thinking-preview/,
    ],
    families: [KIMI_FAMILY, /^moonshot-v(\d+)(?=-|$)/],
    notRecommended: [/vision/],
  },
  'kimi-code': {
    deny: NON_CHAT_MODELS,
    // Kimi Code ids drop the `kimi-` prefix (`k3.1-pro`, `k3-256k`).
    families: [/^k(\d+)(?:\.(\d+))?(?=-|$)/, KIMI_FAMILY],
    // Highspeed variants need the top membership tiers.
    notRecommended: [/highspeed/],
  },
};

/**
 * Providers whose snapshot entry is their complete, fixed plan catalog.
 * Kimi Code plans accept a documented fixed set of models
 * (https://www.kimi.com/code/docs/en/); models.dev lists exactly that set for
 * `kimi-code-plan-cn`, so the snapshot supplies it and is merged with any
 * listing the endpoint returns. Other providers list what a key may use
 * themselves; their snapshot is never merged in, because it also contains
 * models a key cannot reach.
 */
const SNAPSHOT_CATALOG_PROVIDERS: ReadonlySet<string> = new Set(['kimi-code']);

/** A provider's fixed plan catalog from the snapshot, else nothing. */
export const getDocumentedProviderModels = (
  provider: string,
): IProviderModelEntry[] =>
  SNAPSHOT_CATALOG_PROVIDERS.has(provider)
    ? listModelsDevModels(provider).map(({ id }) => ({ id }))
    : [];

const FALLBACK_RULES: IProviderCatalogRules = {
  deny: NON_CHAT_MODELS,
  families: [],
  notRecommended: [],
};

/** `-2024-08-06`, or `-0709` before an optional `-preview`. */
const SNAPSHOT_SUFFIX = /-(\d{4}-\d{2}-\d{2}|\d{4})(?=(-preview)?$)/;

/** The alias a dated snapshot belongs to, or null for an undated id. */
const snapshotAlias = (id: string): string | null =>
  SNAPSHOT_SUFFIX.test(id) ? id.replace(SNAPSHOT_SUFFIX, '') : null;

const snapshotDate = (id: string): string =>
  id.match(SNAPSHOT_SUFFIX)?.[1].replace(/-/g, '') ?? '';

interface IRankedModel extends IProviderModelEntry {
  family: string;
  tier: number;
  version: number;
}

const classifyFamily = (
  id: string,
  rules: IProviderCatalogRules,
): Pick<IRankedModel, 'family' | 'tier' | 'version'> => {
  for (const [tier, pattern] of rules.families.entries()) {
    const match = id.toLowerCase().match(pattern);

    if (match) {
      const major = Number(match[1]);
      const minor = match[2] ? Number(match[2]) : 0;

      return {
        family: match[0],
        tier,
        version: major + minor / 100,
      };
    }
  }

  return { family: '', tier: rules.families.length, version: 0 };
};

/** Newest generation first; within a line the bare alias before variants. */
const compareRanked = (a: IRankedModel, b: IRankedModel): number =>
  a.tier - b.tier ||
  b.version - a.version ||
  a.id.length - b.id.length ||
  (b.created ?? 0) - (a.created ?? 0) ||
  a.id.localeCompare(b.id);

/**
 * Whether one id is a chat model the agent can drive. A model the snapshot
 * knows is judged by its data alone: it must call tools, take text and answer
 * in text only (audio, image or realtime output needs another API). The name
 * patterns are the fallback for ids the snapshot does not know, such as dated
 * snapshots or models newer than the bundled data.
 */
export const isUsableProviderModel = (
  provider: string,
  id: string,
): boolean => {
  const known = findModelsDevModel(provider, id);

  if (known) {
    const input = known.modalities?.input ?? [];
    const output = known.modalities?.output ?? [];

    return (
      known.tool_call === true &&
      input.includes('text') &&
      output.length > 0 &&
      output.every((modality) => modality === 'text')
    );
  }

  return !(PROVIDER_CATALOG_RULES[provider] ?? FALLBACK_RULES).deny.some(
    (pattern) => pattern.test(id.toLowerCase()),
  );
};

/**
 * Filters, de-duplicates, collapses and ranks one provider's listing.
 *
 * - Ids denied by the provider's rules are dropped.
 * - A dated snapshot is dropped when its alias is listed; among snapshots of
 *   an unlisted alias only the newest is kept.
 * - `preferred` ids (the stored connection model, then the provider default)
 *   always survive collapsing when listed and lead the recommended list.
 * - The rest of the recommended list is the best-ranked models of the
 *   leading generation line, up to `RECOMMENDED_MODEL_LIMIT` in total.
 */
export const buildProviderModelCatalog = ({
  provider,
  entries,
  preferred = [],
}: {
  provider: string;
  entries: IProviderModelEntry[];
  preferred?: string[];
}): IAgentsModelInfo[] => {
  const rules = PROVIDER_CATALOG_RULES[provider] ?? FALLBACK_RULES;
  const usable = new Map<string, IProviderModelEntry>();

  for (const entry of entries) {
    const id = entry.id.trim();

    if (id && !usable.has(id) && isUsableProviderModel(provider, id)) {
      usable.set(id, { ...entry, id });
    }
  }

  const preferredIds = preferred.filter((id) => usable.has(id));
  const newestSnapshot = new Map<string, string>();

  for (const id of usable.keys()) {
    const alias = snapshotAlias(id);
    const current = alias ? newestSnapshot.get(alias) : undefined;

    if (alias && (!current || snapshotDate(id) > snapshotDate(current))) {
      newestSnapshot.set(alias, id);
    }
  }

  const ranked = Array.from(usable.values())
    .filter(({ id }) => {
      const alias = snapshotAlias(id);

      return (
        !alias ||
        preferredIds.includes(id) ||
        (!usable.has(alias) && newestSnapshot.get(alias) === id)
      );
    })
    .map((entry) => ({ ...entry, ...classifyFamily(entry.id, rules) }))
    .sort(compareRanked);

  const recommended = new Set(preferredIds);
  const bestTier = ranked[0]?.tier;

  for (const { id, tier } of ranked) {
    if (recommended.size >= RECOMMENDED_MODEL_LIMIT || tier !== bestTier) {
      break;
    }

    if (
      !rules.notRecommended.some((pattern) => pattern.test(id.toLowerCase()))
    ) {
      recommended.add(id);
    }
  }

  return ranked.map(({ id, family }) => ({
    id,
    family,
    recommended: recommended.has(id),
  }));
};
