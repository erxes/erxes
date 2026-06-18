import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { MASTRA_SETTINGS, MASTRA_AGENTS } from '~/graphql/queries';
import { MASTRA_SETTINGS_SAVE } from '~/graphql/mutations';
import { IAgentsResponse, ISettingsResponse } from '../types';

/** Settings document, enabled-agent options and the save mutation. */
export const useGeneralSettings = () => {
  const { data: settingsData } = useQuery<ISettingsResponse>(MASTRA_SETTINGS);
  const { data: agentsData } = useQuery<IAgentsResponse>(MASTRA_AGENTS);
  const [save, { loading: saving }] = useMutation(MASTRA_SETTINGS_SAVE, {
    refetchQueries: [{ query: MASTRA_SETTINGS }],
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  return {
    settings: settingsData?.mastraSettings ?? null,
    agents: agentsData?.mastraAgents ?? [],
    save,
    saving,
  };
};
