import { QueryHookOptions, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { GET_TICKET_CONFIG_BY_PIPELINE_ID } from '../graphql/queries/getTicketConfigBetPipelineId';
import type {
  TicketConfigQuery,
  TicketConfigQueryVariables,
} from '~/gql/graphql';

export const useGetTicketConfigByPipelineId = (
  options?: QueryHookOptions<TicketConfigQuery, TicketConfigQueryVariables>,
) => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
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
