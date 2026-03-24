import { useAtomValue } from 'jotai';
import { customerIdAtom } from '../../states';
import { useQuery } from '@apollo/client';
import { GET_TICKETS_BY_CUSTOMER_ID } from '../graphql/queries';

export const useGetTicketsByCustomer = () => {
  const customerId = useAtomValue(customerIdAtom);
  const { data, loading, error } = useQuery(GET_TICKETS_BY_CUSTOMER_ID, {
    variables: { customerId: customerId },
    skip: !customerId,
  });
  return { tickets: data?.widgetTicketsByCustomer, loading, error };
};
