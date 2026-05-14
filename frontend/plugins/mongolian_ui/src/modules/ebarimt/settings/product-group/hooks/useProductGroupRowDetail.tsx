import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useQuery } from '@apollo/client';
import { productGroupDetailAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { GET_PRODUCT_GROUP } from '@/ebarimt/settings/product-group/graphql/queries/getProductGroup';

export const useProductGroupRowDetail = () => {
  const [productGroupId, setProductGroupId] =
    useQueryState<string>('product_group_id');
  const productGroupDetail = useAtomValue(productGroupDetailAtom);
  const { data, loading } = useQuery(GET_PRODUCT_GROUP, {
    variables: { id: productGroupId },
    skip: !!productGroupDetail || !productGroupId,
  });

  return {
    productGroupDetail:
      productGroupDetail && productGroupDetail?._id === productGroupId
        ? productGroupDetail
        : data?.productGroupDetail,
    loading,
    closeDetail: () => setProductGroupId(null),
  };
};
 