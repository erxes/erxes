import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { GET_FIXED_ASSET_CATEGORY_DETAIL } from '../graphql/queries/fixedAssets';

export const useFixedAssetCategoryDetail = (id: string) => {
  const { data: queryData, loading } = useQuery(
    GET_FIXED_ASSET_CATEGORY_DETAIL,
    { variables: { id }, skip: !id },
  );
  const data = toGraphqlView(queryData);

  return {
    fixedAssetCategoryDetail: data?.fixedAssetCategoryDetail,
    loading,
  };
};
