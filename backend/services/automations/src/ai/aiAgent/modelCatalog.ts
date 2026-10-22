import { AI_AGENT_SUPPORTED_PROVIDERS } from './constants';
import { AI_MODEL_CATALOG } from './modelCatalog.generated';

export type TAiAgentProvider = (typeof AI_AGENT_SUPPORTED_PROVIDERS)[number];

export type TAiModelCatalogEntry = {
  // Text in, text out and tool calling — what an agent turn needs.
  agent: boolean;
  deprecated?: boolean;
  releasedAt?: string;
  reasoning?: boolean;
  contextWindow?: number;
};

export type TAiModelCatalog = Record<
  TAiAgentProvider,
  Record<string, TAiModelCatalogEntry>
>;

export const getAiModelCatalog = (
  provider: TAiAgentProvider,
): Map<string, TAiModelCatalogEntry> =>
  new Map(Object.entries(AI_MODEL_CATALOG[provider] || {}));
