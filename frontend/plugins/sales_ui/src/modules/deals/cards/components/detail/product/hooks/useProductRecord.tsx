import { onLocalChangeAtom } from '../productTableAtom';
import { useAtomValue } from 'jotai';
import { useDealsEditProductData } from './mutations/useDealsEditProductData';
import { IProductData } from 'ui-modules';

export const useUpdateProductRecord = () => {
  const { editDealsProductData } = useDealsEditProductData();
  const processId = localStorage.getItem('processId') || '';
  const onLocalChange = useAtomValue(onLocalChangeAtom);

  const updateRecord = (
    product: IProductData,
    patch: Partial<IProductData>,
  ) => {
    const doc = { ...product, ...patch };

    if (onLocalChange && product._id) {
      onLocalChange(product._id, patch);
    }

    const request = editDealsProductData({
      variables: {
        processId,
        dataId: product._id,
        doc,
      },
    });

    // Rollback attaches here so fire-and-forget callers don't surface an
    // unhandled rejection; awaiting callers still observe the failure.
    request.catch(() => {
      if (onLocalChange && product._id) {
        const revertPatch = Object.fromEntries(
          Object.keys(patch).map((key) => [
            key,
            product[key as keyof IProductData],
          ]),
        ) as Partial<IProductData>;

        onLocalChange(product._id, revertPatch);
      }
    });

    return request;
  };

  return { updateRecord };
};
