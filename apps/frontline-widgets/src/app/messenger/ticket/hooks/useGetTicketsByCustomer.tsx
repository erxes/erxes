import { useAtomValue } from 'jotai';
import { integrationIdAtom } from '../../states';
import { useQuery } from '@apollo/client';
import { GET_TICKETS_BY_CUSTOMER_ID } from '../graphql';
import { ITicketCheckProgress } from '../types';

interface IQueryResponse {
  widgetTicketsByCustomer: ITicketCheckProgress[];
}

export const useGetTicketsByCustomer = () => {
  // The session token says whose tickets these are; wait until connected.
  const integrationId = useAtomValue(integrationIdAtom);

  const { data, loading, error } = useQuery<IQueryResponse>(
    GET_TICKETS_BY_CUSTOMER_ID,
    {
      fetchPolicy: 'cache-and-network',
      skip: !integrationId,
    },
  );

  return { tickets: data?.widgetTicketsByCustomer, loading, error };
};
