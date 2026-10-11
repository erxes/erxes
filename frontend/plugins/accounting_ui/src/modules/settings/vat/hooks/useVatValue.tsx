import type {
  AccountingVatRowDetailQuery,
  AccountingVatRowDetailQueryVariables,
} from '~/gql/graphql';
import type { QueryHookOptions } from '@apollo/client';
import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_VAT_VALUE } from '../graphql/queries/getVats';

export const useVatValue = (
  options?: QueryHookOptions<
    AccountingVatRowDetailQuery,
    AccountingVatRowDetailQueryVariables
  >,
) => {
  const { data: queryData, loading } = useQuery(GET_VAT_VALUE, {
    ...options,
  });
  const data = toGraphqlView(queryData);

  return {
    vatRowDetail: data?.vatRowDetail,
    loading,
  };
};
