import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_FIXED_ASSET_CATEGORY_DETAIL } from '../graphql/queries/fixedAssets';

export const useFixedAssetCategoryDetail = () => {
  const [fixedAssetCategoryId, setFixedAssetCategoryId] = useQueryState<string>(
    'fixedAssetCategoryId',
  );
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
    closeDetail: () => setFixedAssetCategoryId(null),
  };
};
