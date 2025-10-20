import { useQuery, QueryHookOptions } from '@apollo/client';
import { GET_TICKET_STATUS_BY_TYPE } from '../graphql/queries/getTicketStatusByType';
export const useGetTicketStatusByType = (options?: QueryHookOptions) => {
  const { data, loading, error } = useQuery(GET_TICKET_STATUS_BY_TYPE, options);
  return { data, loading, error };
};
