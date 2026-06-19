import { useQuery } from '@apollo/client';
import { MASTRA_AVAILABLE_ERXES_TOOLS } from '~/graphql/queries';
import { IAvailableErxesToolsResponse } from '../types';

/**
 * Live list of runnable erxes operations (cached server-side), used only when
 * restricting an agent. Fetched lazily — no need to load it for "All tools".
 */
export const useAvailableErxesTools = (enabled: boolean) => {
  const { data, loading } = useQuery<IAvailableErxesToolsResponse>(
    MASTRA_AVAILABLE_ERXES_TOOLS,
    { skip: !enabled },
  );

  return {
    operations: data?.mastraAvailableErxesTools ?? [],
    loading,
  };
};
