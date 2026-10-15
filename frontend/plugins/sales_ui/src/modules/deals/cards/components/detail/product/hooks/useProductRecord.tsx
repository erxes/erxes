import { onLocalChangeAtom } from '../productTableAtom';
import { useAtomValue } from 'jotai';
import { useDealsEditProductData } from './mutations/useDealsEditProductData';
import { ProductDataWithDiscountInfos } from '../utils/discountInfos';
import { normalizeProductUom, syncProductUomInfo } from '../utils/productUom';

export const useUpdateProductRecord = () => {
  const { editDealsProductData } = useDealsEditProductData();
  const onLocalChange = useAtomValue(onLocalChangeAtom);

  const updateRecord = (
    product: ProductDataWithDiscountInfos,
    patch: Partial<ProductDataWithDiscountInfos>,
  ) => {
    const merged = { ...product, ...patch };
    const doc = patch.uomInfo
      ? normalizeProductUom(merged)
      : syncProductUomInfo(merged);
    const normalizedPatch = {
      ...patch,
      uom: doc.uom,
      uomInfo: doc.uomInfo,
      unitPrice: doc.unitPrice,
      quantity: doc.quantity,
    };
    const processId = crypto.randomUUID();
    localStorage.setItem('processId', processId);

    if (onLocalChange && product._id) {
      onLocalChange(product._id, normalizedPatch);
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
          Object.keys(normalizedPatch).map((key) => [
            key,
            product[key as keyof ProductDataWithDiscountInfos],
          ]),
        ) as Partial<ProductDataWithDiscountInfos>;

        onLocalChange(product._id, revertPatch);
      }
    });

    return request;
  };

  return { updateRecord };
};
