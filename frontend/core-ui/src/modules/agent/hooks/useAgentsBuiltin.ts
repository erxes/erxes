import { useQuery } from '@apollo/client';

import { AGENTS_BUILTIN } from '../graphql/connection';
import type { IAgentsBuiltin, IAgentsBuiltinData } from '../graphql/connection';

export interface IUseAgentsBuiltinResult {
  builtin: IAgentsBuiltin | null;
  percent: number | null;
  loading: boolean;
}

export const useAgentsBuiltin = (): IUseAgentsBuiltinResult => {
  const { data, loading } = useQuery<IAgentsBuiltinData>(AGENTS_BUILTIN, {
    fetchPolicy: 'cache-and-network',
  });
  const builtin = data?.agentsBuiltin ?? null;
  const percent =
    builtin?.limitTokens && builtin.limitTokens > 0
      ? Math.min(100, (builtin.usedTokens / builtin.limitTokens) * 100)
      : null;

  return { builtin, percent, loading };
};
