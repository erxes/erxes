import { useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { useMemo } from 'react';
import { queries } from '../graphql';
import { hasId } from '../utils/posJson';

export const useProductGroups = (posId?: string) => {
  const { data, loading, error, refetch } = useQuery(queries.productGroups, {
    variables: posId ? { posId } : undefined,
    skip: !posId,
    fetchPolicy: 'network-only',
  });
  const productGroups = useMemo(
    () =>
      (data?.productGroups ?? []).filter(hasId).map((group) => ({
        ...group,
        categoryIds: (group.categoryIds ?? []).filter(isDefined),
        excludedCategoryIds: (group.excludedCategoryIds ?? []).filter(
          isDefined,
        ),
        excludedProductIds: (group.excludedProductIds ?? []).filter(isDefined),
      })),
    [data?.productGroups],
  );
  return { productGroups, loading, error, refetch };
};
