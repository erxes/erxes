import { useQuery } from '@apollo/client';

import { AGENTS_SETTINGS } from '../graphql/settings';
import type { IAgentsSettings, IAgentsSettingsData } from '../graphql/settings';

export interface IUseAgentsSettingsResult {
  settings: IAgentsSettings | null;
  loading: boolean;
  error: string | undefined;
}

/**
 * Loads the tenant-wide agents settings (admin-controlled code-mode flag).
 * Every agents user can read the state; only admins can change it.
 */
export const useAgentsSettings = (): IUseAgentsSettingsResult => {
  const { data, loading, error } = useQuery<IAgentsSettingsData>(
    AGENTS_SETTINGS,
  );

  return {
    settings: data?.agentsSettings ?? null,
    loading,
    error: error?.message,
  };
};
