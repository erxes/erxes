import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';
import { useTranslation } from 'react-i18next';
import { type IProduct, SelectProductsBulk } from 'ui-modules';

import { calculateProductValues } from '@/deals/cards/components/detail/product/hooks/useProductCalculations';
import { useUpdateProductRecord } from '@/deals/cards/components/detail/product/hooks/useProductRecord';
import type { ProductDataWithUom } from '../utils/productUom';
import { getProductDefaultUom } from '../utils/productUom';

interface ProductEditSheetProps {
  productData: DealProductData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProductEditSheet = ({
  productData,
  open,
  onOpenChange,
}: ProductEditSheetProps) => {
  const { t } = useTranslation('sales');
  const { updateRecord } = useUpdateProductRecord();
  const currentProduct = productData?.product;

  if (!productData || !currentProduct) {
    return null;
  }

  const replaceProduct = async (
    productIds: string[],
    selectedProducts: DealProduct[] = [],
  ) => {
    const replacementProduct = selectedProducts.find(
      (product) => product._id === productIds[0],
    );

    if (!replacementProduct || replacementProduct._id === currentProduct._id) {
      return;
    }

    const patch: Partial<ProductDataWithUom> = {
      productId: replacementProduct._id,
      product: replacementProduct,
      unitPrice: replacementProduct.unitPrice,
      globalUnitPrice: replacementProduct.unitPrice,
      unitPricePercent: 100,
      uom: getProductDefaultUom(replacementProduct),
      uomInfo: undefined,
    };
    const calculatedValues = calculateProductValues('discountPercent', {
      ...productData,
      ...patch,
    });

    await updateRecord(productData, {
      ...patch,
      ...calculatedValues,
    });
  };

  return (
    <SelectProductsBulk
      open={open}
      onOpenChange={onOpenChange}
      productIds={[currentProduct._id]}
      // The shared picker reads only _id/name/code from its initial selection.
      // Keep the cached preview without claiming the query returns a full product.
      initialProducts={[currentProduct as IProduct]}
      selectionLimit={1}
      title={t('edit-product')}
      description={t('edit-product-description')}
      selectedLabel={t('selected')}
      submitLabel={t('save')}
      cancelLabel={t('cancel')}
      isSelectionValid={(productIds) => productIds[0] !== currentProduct._id}
      onSelect={replaceProduct}
    />
  );
};
