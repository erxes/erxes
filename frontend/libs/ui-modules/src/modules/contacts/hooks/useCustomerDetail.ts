import { useQuery, QueryHookOptions } from '@apollo/client';
import {
  CUSTOMER_INLINE,
  CUSTOMER_DETAIL,
} from '../graphql/queries/customerDetailQueries';
import { ICustomerDetail } from '../types';

export const useCustomerDetail = (
  options: QueryHookOptions<{ customerDetail: ICustomerDetail }>,
  inline?: boolean,
) => {
  const { data, loading, error } = useQuery<{
    customerDetail: ICustomerDetail;
  }>(inline ? CUSTOMER_INLINE : CUSTOMER_DETAIL, options);

  return {
    loading,
    customerDetail: data?.customerDetail,
    error,
  };
};
