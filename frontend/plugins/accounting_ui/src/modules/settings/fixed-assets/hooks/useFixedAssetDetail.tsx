import { useQuery } from '@apollo/client';
import { useQueryState } from 'erxes-ui';
import { GET_FIXED_ASSET_DETAIL } from '../graphql/queries/fixedAssets';

export const useFixedAssetDetail = () => {
  const [fixedAssetId, setFixedAssetId] = useQueryState('fixedAssetId');
  const { data, loading } = useQuery(GET_FIXED_ASSET_DETAIL, {
    variables: { id: fixedAssetId },
    skip: !fixedAssetId,
  });

  return {
    fixedAssetDetail: data?.fixedAssetDetail,
    loading,
    closeDetail: () => setFixedAssetId(null),
  };
};
