import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_VAT_VALUE } from '@/settings/vat/graphql/queries/getVats';

export const useVatRowDetail = (vatRowId?: string) => {
  const { data: queryData, loading } = useQuery(GET_VAT_VALUE, {
    variables: { id: vatRowId ?? '' },
    skip: !vatRowId,
  });
  const data = toGraphqlView(queryData);

  return {
    vatRowDetail: data?.vatRowDetail,
    loading,
  };
};
