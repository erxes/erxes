import { QueryHookOptions, useQuery } from '@apollo/client';
import { IConfig } from './useGetTicketConfigs';
import { GET_CONFIG_DETAIL } from '../graphql';

interface ITicketConfigDetailResponse {
  ticketConfigDetail: IConfig;
}

export const useGetTicketConfigDetail = (
  options?: QueryHookOptions<ITicketConfigDetailResponse>,
) => {
  const { data, loading } = useQuery<ITicketConfigDetailResponse>(
    GET_CONFIG_DETAIL,
    options,
  );
  return {
    ticketConfigDetail: data?.ticketConfigDetail,
    loading,
  };
};
