import { onLocalChangeAtom } from '../productTableAtom';
import { useAtomValue } from 'jotai';
import { useDealsEditProductData } from '../hooks/useDealsEditProductData';
import { useQueryState } from 'erxes-ui';

export const useUpdateProductRecord = () => {
  const { editDealsProductData } = useDealsEditProductData();
  const [salesItemId] = useQueryState<string>('salesItemId');
  const processId = localStorage.getItem('processId') || '';
  const onLocalChange = useAtomValue(onLocalChangeAtom);

  const updateRecord = (product: any, patch: any) => {
    const doc = { ...product, ...patch };

    if (onLocalChange && product._id) {
      onLocalChange(product._id, patch);
    }

    return editDealsProductData({
      variables: {
        processId,
        dealId: salesItemId || '',
        dataId: product._id,
        doc,
      },
    });
  };

  return { updateRecord };
};
