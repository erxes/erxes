import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { AGENTS_MODELS } from '../graphql/connection';
import type {
  IAgentsProviderModels,
  IAgentsModelsData,
} from '../graphql/connection';

export interface IUseAgentsModelsResult {
  /** One group per configured provider whose /models fetch succeeded. */
  providerModels: IAgentsProviderModels[];
  loading: boolean;
  error: string | undefined;
}

/**
 * Lists the model ids of every provider the acting user has configured.
 * The backend fetches each provider's /models endpoint server-side with the
 * stored keys, so no secret ever reaches the browser; providers whose
 * listing fails are simply absent from the result.
 */
export const useAgentsModels = (): IUseAgentsModelsResult => {
  const { data, loading, error } = useQuery<IAgentsModelsData>(
    AGENTS_MODELS,
    { fetchPolicy: 'network-only' },
  );

  const providerModels = useMemo(
    () =>
      (data?.agentsModels ?? []).filter(
        (group) => (group.models ?? []).length > 0,
      ),
    [data],
  );

  return {
    providerModels,
    loading,
    error: error?.message,
  };
};
