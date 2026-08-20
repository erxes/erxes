import { QueryHookOptions, useQuery } from '@apollo/client';
import { ICustomer } from 'ui-modules';
import { CALL_PRO_CUSTOMERS_BY_PHONE } from '@/integrations/callpro/graphql/queries/callProQueries';

export const useCallProCustomersByPhone = (
  options?: QueryHookOptions<
    { callProCustomersByPhone: ICustomer[] },
    { phone?: string }
  >,
) => {
  const { data, loading, error } = useQuery(CALL_PRO_CUSTOMERS_BY_PHONE, {
    ...options,
    skip: !options?.variables?.phone || options?.skip,
  });

  const { callProCustomersByPhone } = data || {};

  return { callProCustomersByPhone, loading, error };
};
