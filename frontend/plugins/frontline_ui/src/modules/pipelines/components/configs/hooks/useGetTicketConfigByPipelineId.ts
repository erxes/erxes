import { QueryHookOptions, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { IConfig } from './useGetTicketConfigs';
import { GET_TICKET_CONFIG_BY_PIPELINE_ID } from '../graphql/queries/getTicketConfigBetPipelineId';

interface ITicketConfigResponse {
  ticketConfig: IConfig;
}

export const useGetTicketConfigByPipelineId = (
  options?: QueryHookOptions<ITicketConfigResponse>,
) => {
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { data, loading } = useQuery<ITicketConfigResponse>(
    GET_TICKET_CONFIG_BY_PIPELINE_ID,
    {
      variables: { pipelineId },
      ...options,
      skip: !pipelineId,
    },
  );
  return {
    ticketConfig: data?.ticketConfig,
    loading,
  };
};
