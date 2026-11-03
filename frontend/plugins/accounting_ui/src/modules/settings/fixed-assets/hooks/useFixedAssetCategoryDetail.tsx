import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_FIXED_ASSET_CATEGORY_DETAIL } from '@/settings/fixed-assets/graphql/queries/fixedAssets';

export const useFixedAssetCategoryDetail = (fixedAssetCategoryId?: string) => {
  const { data: queryData, loading } = useQuery(
    GET_FIXED_ASSET_CATEGORY_DETAIL,
    {
      variables: { id: fixedAssetCategoryId ?? '' },
      skip: !fixedAssetCategoryId,
    },
  );
  const data = toGraphqlView(queryData);

  return {
    fixedAssetCategoryDetail: data?.fixedAssetCategoryDetail,
    loading,
  };
};
