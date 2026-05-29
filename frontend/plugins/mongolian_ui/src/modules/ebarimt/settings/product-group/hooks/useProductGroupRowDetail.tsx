import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { productGroupDetailAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';

export const useProductGroupRowDetail = () => {
  const [productGroupId, setProductGroupId] =
    useQueryState<string>('product_group_id');
  const productGroupDetail = useAtomValue(productGroupDetailAtom);

  const detail: IProductGroup | null =
    productGroupDetail?._id === productGroupId ? productGroupDetail : null;

  return {
    productGroupDetail: detail,
    loading: false,
    closeDetail: () => setProductGroupId(null),
  };
};
