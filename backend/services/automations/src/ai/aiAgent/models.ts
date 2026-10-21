import { createHash } from 'crypto';
import { redis } from 'erxes-api-shared/utils';
import { getAiProviderBridge } from '../bridge';
import type { TAiBridgeConnection, TAiBridgeRuntime } from '../bridge/types';
import { resolveAiProviderConnection } from '../providers';
import {
  AI_AGENT_PROVIDER_DEFAULT_MODELS,
  AI_AGENT_RECOMMENDED_MODELS,
} from './constants';
import { aiAgentConnectionSchema } from './connection';
import { aiAgentInputSchema, TAiAgentInput } from './contract';
import {
  getAiModelCatalog,
  TAiAgentProvider,
  TAiModelCatalogEntry,
} from './modelCatalog';

const LIVE_MODELS_TTL_SECONDS = 24 * 60 * 60;

export type TAiAgentModelGroup =
  | 'selected'
  | 'recommended'
  | 'available'
  // Live ids the catalog does not know: fine-tunes, brand-new or non-chat models.
  | 'other';

export type TAiAgentModelStatus =
  | 'available'
  | 'deprecated'
  // The provider list loaded and this id is not in it.
  | 'unavailable'
  // No provider list to check against; never shown as an error.
  | 'unverified';

export type TAiAgentModelOption = {
  id: string;
  group: TAiAgentModelGroup;
  status: TAiAgentModelStatus;
  // Only on the selected model when it should be replaced.
  suggestion?: string;
  // What a new agent should start with; resolved here so a retired default
  // never reaches new agents.
  isDefault?: boolean;
  releasedAt?: string;
  reasoning?: boolean;
  contextWindow?: number;
};

const byReleasedDesc =
  (catalog: Map<string, TAiModelCatalogEntry>) => (a: string, b: string) => {
    const left = catalog.get(a)?.releasedAt || '';
    const right = catalog.get(b)?.releasedAt || '';

    return right.localeCompare(left) || a.localeCompare(b);
  };

export const buildAiAgentModelOptions = ({
  provider,
  selectedModel,
  liveIds,
}: {
  provider: TAiAgentProvider;
  selectedModel?: string;
  liveIds: string[] | null;
}): TAiAgentModelOption[] => {
  const catalog = getAiModelCatalog(provider);
  const live = liveIds ? new Set(liveIds) : null;

  const statusOf = (id: string): TAiAgentModelStatus => {
    if (!live) {
      return 'unverified';
    }

    if (!live.has(id)) {
      return 'unavailable';
    }

    return catalog.get(id)?.deprecated ? 'deprecated' : 'available';
  };

  const recommended = (AI_AGENT_RECOMMENDED_MODELS[provider] || []).filter(
    (id) => (live ? live.has(id) : !catalog.get(id)?.deprecated),
  );

  // Without a live list the catalog is the best guess of what exists now.
  const candidates = live
    ? [...live]
    : [...catalog.keys()].filter((id) => !catalog.get(id)?.deprecated);
  const agentModels = candidates
    .filter((id) => catalog.get(id)?.agent)
    .sort(byReleasedDesc(catalog));
  const unknown = live ? [...live].filter((id) => !catalog.has(id)).sort() : [];

  const seen = new Set<string>();
  const options: TAiAgentModelOption[] = [];

  const take = (ids: string[], group: TAiAgentModelGroup) => {
    for (const id of ids) {
      if (!id || seen.has(id)) {
        continue;
      }

      seen.add(id);

      const entry = catalog.get(id);

      options.push({
        id,
        group,
        status: statusOf(id),
        releasedAt: entry?.releasedAt,
        reasoning: entry?.reasoning,
        contextWindow: entry?.contextWindow,
      });
    }
  };

  take(selectedModel ? [selectedModel] : [], 'selected');
  take(recommended, 'recommended');
  take(agentModels, 'available');
  take(unknown, 'other');

  // The configured default wins while it works; after that a curated pick, and
  // when those are all stale too, the newest catalog model.
  const defaultId = [
    AI_AGENT_PROVIDER_DEFAULT_MODELS[provider],
    ...recommended,
    ...agentModels,
  ].find((id) =>
    live ? statusOf(id) === 'available' : !catalog.get(id)?.deprecated,
  );
  const defaultOption = options.find(({ id }) => id === defaultId);

  if (defaultOption) {
    defaultOption.isDefault = true;
  }

  const selected = options[0];

  if (
    selected?.group === 'selected' &&
    ['deprecated', 'unavailable'].includes(selected.status) &&
    defaultId !== selected.id
  ) {
    selected.suggestion = defaultId;
  }

  return options;
};

const liveModelsCacheKey = (
  subdomain: string,
  connection: TAiBridgeConnection,
) => {
  const fingerprint = createHash('sha256')
    .update(`${connection.provider}:${JSON.stringify(connection.config)}`)
    .digest('hex');

  return `automations:aiModels:${subdomain}:${fingerprint}`;
};

const getLiveModelIds = async ({
  subdomain,
  connection: storedConnection,
  runtime,
}: {
  subdomain: string;
  connection: TAiBridgeConnection;
  runtime: TAiBridgeRuntime;
}): Promise<string[] | null> => {
  const connection = resolveAiProviderConnection({
    subdomain,
    connection: storedConnection,
  });
  const key = liveModelsCacheKey(subdomain, connection);

  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached);
  }

  const ids = await getAiProviderBridge(connection.provider).listModels({
    connection,
    runtime,
  });

  // Failures are not cached so a fixed key shows models on the next open.
  if (ids) {
    await redis.set(key, JSON.stringify(ids), 'EX', LIVE_MODELS_TTL_SECONDS);
  }

  return ids;
};

export const listAiAgentModels = async ({
  subdomain,
  storedAgent,
  provider,
  selectedModel,
}: {
  subdomain: string;
  storedAgent: TAiAgentInput | null;
  provider: TAiAgentProvider;
  selectedModel?: string;
}): Promise<TAiAgentModelOption[]> => {
  // A provider switched in the form must not receive the old provider's key;
  // an empty config falls back to the platform env key on resolve.
  const connection =
    storedAgent && storedAgent.connection.provider === provider
      ? storedAgent.connection
      : aiAgentConnectionSchema.parse({ provider });
  const runtime =
    storedAgent?.runtime || aiAgentInputSchema.shape.runtime.parse(undefined);

  const liveIds = await getLiveModelIds({
    subdomain,
    connection,
    runtime,
  }).catch(() => null);

  return buildAiAgentModelOptions({ provider, selectedModel, liveIds });
};
