import { useQuery } from '@apollo/client';
import { compactList } from '@/shared/utils/cursorList';
import { GET_EBARIMT_PRODUCT_RULES } from '@/shared/graphql/ebarimtProductRules';

export const useEbarimtProductRules = (kind: string) => {
  const { data, loading, error, refetch } = useQuery(
    GET_EBARIMT_PRODUCT_RULES,
    {
      variables: {
        kind,
      },
      fetchPolicy: 'cache-and-network',
    },
  );

  return {
    productRules: compactList(data?.ebarimtProductRules?.list).flatMap((rule) =>
      rule._id
        ? [
            {
              ...rule,
              _id: rule._id,
              title: rule.title ?? '',
              kind: rule.kind ?? '',
            },
          ]
        : [],
    ),
    loading,
    error,
    refetch,
    totalCount: data?.ebarimtProductRules?.totalCount || 0,
  };
};
