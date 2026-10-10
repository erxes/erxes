import { toGraphqlView } from '@/utils/graphql';
import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_FIXED_ASSET_DETAIL } from '../graphql/queries/fixedAssets';

export const useFixedAssetDetail = () => {
  const [fixedAssetId, setFixedAssetId] = useQueryState<string>('fixedAssetId');
  const { data: queryData, loading } = useQuery(GET_FIXED_ASSET_DETAIL, {
    variables: { id: fixedAssetId ?? '' },
    skip: !fixedAssetId,
  });
  const data = toGraphqlView(queryData);

  return {
    fixedAssetDetail: data?.fixedAssetDetail,
    loading,
    closeDetail: () => setFixedAssetId(null),
  };
};
