import { QueryHookOptions, useQuery } from '@apollo/client';
import { useSettingsParams } from '@/settings/contexts/SettingsPanelContext';
import { GET_TICKET_CONFIG_BY_PIPELINE_ID } from '../graphql/queries/getTicketConfigBetPipelineId';
import type {
  TicketConfigQuery,
  TicketConfigQueryVariables,
} from '~/gql/graphql';

/** Loads a ticket configuration using the settings pipeline as a default. */
export const useGetTicketConfigByPipelineId = (
  options?: QueryHookOptions<TicketConfigQuery, TicketConfigQueryVariables>,
) => {
  const { pipelineId } = useSettingsParams();
  const { data, loading } = useQuery(GET_TICKET_CONFIG_BY_PIPELINE_ID, {
    variables: pipelineId ? { pipelineId } : undefined,
    ...options,
    skip: !pipelineId,
  });
  return {
    ticketConfig: data?.ticketConfig ?? undefined,
    loading,
  };
};
