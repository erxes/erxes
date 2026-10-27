import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { AGENTS_MODELS } from '../graphql/connection';
import type {
  IAgentsModelInfo,
  IAgentsModelsData,
} from '../graphql/connection';
import { toModelThinking } from '../utils/thinkingLevels';
import type { IAgentsModelThinking } from '../utils/thinkingLevels';

/** One usable model of a provider, in the backend's ranked order. */
export interface IAgentsModelOption {
  id: string;
  family: string;
  recommended: boolean;
  /** Human name; absent or null shows the raw id. */
  name?: string | null;
  /** Absent or null: no catalog data, the original five levels apply. */
  thinking?: IAgentsModelThinking | null;
}

export interface IAgentsProviderCatalog {
  provider: string;
  /** Usable chat models only; empty when the listing failed. */
  models: IAgentsModelOption[];
  /** Key-free reason this provider's listing failed. */
  error?: string;
}

export interface IUseAgentsModelsResult {
  /** One entry per configured provider, including ones whose listing failed. */
  providerModels: IAgentsProviderCatalog[];
  loading: boolean;
  error: string | undefined;
}

/**
 * Lists the usable models of every provider the acting user has configured.
 * The backend fetches each provider's /models endpoint server-side with the
 * stored keys (no secret reaches the browser) and filters it to chat models
 * the agent can run, marking a short recommended list per provider.
 */
export const useAgentsModels = (): IUseAgentsModelsResult => {
  const { data, loading, error } = useQuery<IAgentsModelsData>(AGENTS_MODELS, {
    fetchPolicy: 'network-only',
  });

  const providerModels = useMemo(
    () =>
      (data?.agentsModels ?? []).map((group) => ({
        provider: group.provider,
        models: (
          group.catalog ??
          (group.models ?? []).map(
            (id): IAgentsModelInfo => ({ id, family: '', recommended: false }),
          )
        ).map((model) => ({
          id: model.id,
          family: model.family ?? '',
          recommended: model.recommended === true,
          name: model.name || null,
          thinking: toModelThinking(model.thinking),
        })),
        ...(group.error ? { error: group.error } : {}),
      })),
    [data],
  );

  return {
    providerModels,
    loading,
    error: error?.message,
  };
};
