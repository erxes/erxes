import type { AssistantProvider } from '@erxes/core-contract';
import { findModelsDevModel, listModelsDevModels } from './modelsDev';

export interface ProviderModelEntry {
  id: string;
  created?: number;
}

interface CatalogRules {
  deny: RegExp[];
  families: RegExp[];
  notRecommended: RegExp[];
}

const RECOMMENDED_MODEL_LIMIT = 4;

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

const RULES: Record<AssistantProvider, CatalogRules> = {
  openai: {
    deny: [
      ...NON_CHAT_MODELS,
      /^(babbage|davinci|curie|ada)(-|$)/,
      /instruct/,
      /^gpt-3\.5/,
      /^gpt-4(?![o.])/,
      /^chatgpt-/,
      /chat-latest/,
      /^o1-(mini|preview)/,
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
    families: [/^grok-(\d+)(?:[.-](\d)(?=-|$))?(?=-|$)/],
    notRecommended: [/-non-reasoning$/, /beta/],
  },
  kimi: {
    deny: [...NON_CHAT_MODELS, /^kimi-thinking-preview/],
    families: [KIMI_FAMILY, /^moonshot-v(\d+)(?=-|$)/],
    notRecommended: [/vision/],
  },
  'kimi-code': {
    deny: NON_CHAT_MODELS,
    families: [/^k(\d+)(?:\.(\d+))?(?=-|$)/, KIMI_FAMILY],
    notRecommended: [/highspeed/],
  },
};

const FIXED_CATALOG_PROVIDERS: ReadonlySet<AssistantProvider> = new Set(['kimi-code']);

export const hasFixedCatalog = (provider: AssistantProvider) =>
  FIXED_CATALOG_PROVIDERS.has(provider);

export const documentedModels = (provider: AssistantProvider): ProviderModelEntry[] =>
  hasFixedCatalog(provider) ? listModelsDevModels(provider).map(({ id }) => ({ id })) : [];

const SNAPSHOT_SUFFIX = /-(\d{4}-\d{2}-\d{2}|\d{4})(?=(-preview)?$)/;

const snapshotAlias = (id: string) =>
  SNAPSHOT_SUFFIX.test(id) ? id.replace(SNAPSHOT_SUFFIX, '') : null;

const snapshotDate = (id: string) => id.match(SNAPSHOT_SUFFIX)?.[1]?.replace(/-/g, '') ?? '';

interface RankedModel extends ProviderModelEntry {
  family: string;
  tier: number;
  version: number;
}

const classifyFamily = (id: string, rules: CatalogRules) => {
  for (const [tier, pattern] of rules.families.entries()) {
    const match = id.toLowerCase().match(pattern);

    if (match) {
      return {
        family: match[0],
        tier,
        version: Number(match[1]) + (match[2] ? Number(match[2]) / 100 : 0),
      };
    }
  }

  return { family: '', tier: rules.families.length, version: 0 };
};

const compareRanked = (a: RankedModel, b: RankedModel) =>
  a.tier - b.tier ||
  b.version - a.version ||
  a.id.length - b.id.length ||
  (b.created ?? 0) - (a.created ?? 0) ||
  a.id.localeCompare(b.id);

export const isUsableModel = (provider: AssistantProvider, id: string) => {
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

  return !RULES[provider].deny.some((pattern) => pattern.test(id.toLowerCase()));
};

const latestSnapshots = (ids: Iterable<string>) => {
  const newest = new Map<string, string>();

  for (const id of ids) {
    const alias = snapshotAlias(id);
    const current = alias ? newest.get(alias) : undefined;

    if (alias && (!current || snapshotDate(id) > snapshotDate(current))) newest.set(alias, id);
  }

  return newest;
};

export const buildModelCatalog = (
  provider: AssistantProvider,
  entries: ProviderModelEntry[],
  preferred: string[],
) => {
  const rules = RULES[provider];
  const usable = new Map<string, ProviderModelEntry>();

  for (const entry of entries) {
    const id = entry.id.trim();

    if (id && !usable.has(id) && isUsableModel(provider, id)) usable.set(id, { ...entry, id });
  }

  const preferredIds = preferred.filter((id) => usable.has(id));
  const newest = latestSnapshots(usable.keys());

  const ranked = [...usable.values()]
    .filter(({ id }) => {
      const alias = snapshotAlias(id);

      return (
        !alias || preferredIds.includes(id) || (!usable.has(alias) && newest.get(alias) === id)
      );
    })
    .map((entry) => ({ ...entry, ...classifyFamily(entry.id, rules) }))
    .toSorted(compareRanked);

  const recommended = new Set(preferredIds);
  const bestTier = ranked[0]?.tier;

  for (const { id, tier } of ranked) {
    if (recommended.size >= RECOMMENDED_MODEL_LIMIT || tier !== bestTier) break;

    if (!rules.notRecommended.some((pattern) => pattern.test(id.toLowerCase())))
      recommended.add(id);
  }

  return ranked.map(({ id, family }) => ({ id, family, recommended: recommended.has(id) }));
};
