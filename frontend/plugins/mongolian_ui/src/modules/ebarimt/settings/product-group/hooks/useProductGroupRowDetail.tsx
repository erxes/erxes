import { useQueryState } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useEffect } from 'react';
import { productGroupDetailAtom } from '@/ebarimt/settings/product-group/states/productGroupRowStates';
import { IProductGroup } from '@/ebarimt/settings/product-group/constants/productGroupDefaultValues';

export const useProductGroupRowDetail = () => {
  const [productGroupId, setProductGroupId] =
    useQueryState<string>('product_group_id');
  const productGroupDetail = useAtomValue(productGroupDetailAtom);

  const detail: IProductGroup | null =
    productGroupDetail?._id === productGroupId ? productGroupDetail : null;

  // The detail is only kept in an atom that is populated on row click. On a
  // fresh load / deep-link with product_group_id there is no matching detail,
  // so close the sheet instead of leaving an uninitialized, unsubmittable form.
  useEffect(() => {
    if (productGroupId && !detail) {
      setProductGroupId(null);
    }
  }, [productGroupId, detail, setProductGroupId]);

  return {
    productGroupDetail: detail,
    loading: false,
    closeDetail: () => setProductGroupId(null),
  };
};
