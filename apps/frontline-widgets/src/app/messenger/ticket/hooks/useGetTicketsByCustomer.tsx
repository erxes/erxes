import { useAtomValue } from 'jotai';
import { customerIdAtom } from '../../states';
import { useQuery } from '@apollo/client';
import { GET_TICKETS_BY_CUSTOMER_ID } from '../graphql';
import { ITicketCheckProgress } from '../types';

interface IQueryResponse {
  widgetTicketsByCustomer: ITicketCheckProgress[];
}

export const useGetTicketsByCustomer = () => {
  const customerId = useAtomValue(customerIdAtom);

  const { data, loading, error } = useQuery<IQueryResponse>(
    GET_TICKETS_BY_CUSTOMER_ID,
    {
      variables: { customerId },
      fetchPolicy: 'cache-and-network',
      skip: !customerId,
    },
  );

  return { tickets: data?.widgetTicketsByCustomer, loading, error };
};
