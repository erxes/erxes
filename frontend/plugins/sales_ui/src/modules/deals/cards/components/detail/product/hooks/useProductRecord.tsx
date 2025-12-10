import { useDealsEditProductData } from '../hooks/useDealsEditProductData';
import { useQueryState } from 'erxes-ui';

export const useUpdateProductRecord = () => {
  const { editDealsProductData } = useDealsEditProductData();
  const [salesItemId] = useQueryState<string>('salesItemId');
  const processId = localStorage.getItem('processId') || '';

  const updateRecord = (product: any, patch: any) => {
    const doc = { ...product, ...patch };

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
