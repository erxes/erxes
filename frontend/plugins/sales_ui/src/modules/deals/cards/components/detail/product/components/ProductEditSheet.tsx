import { IProduct, IProductData, SelectProductsBulk } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { calculateProductValues } from '@/deals/cards/components/detail/product/hooks/useProductCalculations';
import { useUpdateProductRecord } from '@/deals/cards/components/detail/product/hooks/useProductRecord';

interface ProductEditSheetProps {
  productData: IProductData | null;
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
    selectedProducts: IProduct[] = [],
  ) => {
    const replacementProduct = selectedProducts.find(
      (product) => product._id === productIds[0],
    );

    if (!replacementProduct || replacementProduct._id === currentProduct._id) {
      return;
    }

    const patch: Partial<IProductData> = {
      productId: replacementProduct._id,
      product: replacementProduct,
      unitPrice: replacementProduct.unitPrice,
      globalUnitPrice: replacementProduct.unitPrice,
      unitPricePercent: 100,
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
      initialProducts={[currentProduct]}
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
