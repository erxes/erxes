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
  const effectivePipelineId = options?.variables?.pipelineId ?? pipelineId;
  const { data, loading, error } = useQuery(GET_TICKET_CONFIG_BY_PIPELINE_ID, {
    ...options,
    variables: effectivePipelineId
      ? { pipelineId: effectivePipelineId }
      : undefined,
    skip: options?.skip || !effectivePipelineId,
  });
  return {
    ticketConfig: data?.ticketConfig ?? undefined,
    loading,
    error,
  };
};
