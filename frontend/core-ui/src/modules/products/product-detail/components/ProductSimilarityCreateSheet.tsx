import { useMemo } from 'react';
import { useFields } from 'ui-modules';
import { BulkProductSheetForm } from '@/products/bulk-similarity/components/BulkProductSheetForm';
import { useAddSimilarity } from '@/products/bulk-similarity/hooks/useAddSimilarity';
import {
  ISimilarityInfo,
  ISimilarityProduct,
  IProductSimilarity,
} from '@/products/bulk-similarity/types';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';

interface ProductSimilarityCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDetail | null;
  callBack?: () => void;
}

const buildInitialInfo = (product?: ProductDetail | null): ISimilarityInfo => {
  if (!product) return {} as ISimilarityInfo;

  const candidate: Partial<ISimilarityInfo> = {
    name: product.name,
    shortName: product.shortName,
    code: product.code,
    categoryId: product.categoryId,
    type: product.type,
    description: product.description,
    barcodeDescription: product.barcodeDescription,
    unitPrice: product.unitPrice,
    currency: product.currency,
    uom: product.uom,
    vendorId: product.vendorId,
    scopeBrandIds: product.scopeBrandIds,
    attachment: product.attachment,
    attachmentMore: Array.isArray(product.attachmentMore)
      ? product.attachmentMore
      : product.attachmentMore
        ? [product.attachmentMore]
        : undefined,
  };

  return Object.fromEntries(
    Object.entries(candidate).filter(
      ([, value]) => value != null && value !== '',
    ),
  ) as ISimilarityInfo;
};

export const ProductSimilarityCreateSheet = ({
  open,
  onOpenChange,
  product,
  callBack,
}: ProductSimilarityCreateSheetProps) => {
  const { add, loading } = useAddSimilarity();
  const { fields } = useFields({ contentType: 'core:product' });

  const initialSimilarity = useMemo<IProductSimilarity>(() => {
    const info = buildInitialInfo(product);

    if (!product?._id) {
      return { _id: '', info, propertiesData: {} };
    }

    const optionFieldIds = new Set(
      fields.filter((f) => (f.options || []).length > 0).map((f) => f._id),
    );
    const productProps = (product.propertiesData || {}) as Record<
      string,
      unknown
    >;

    const propertiesData: Record<string, string[]> = {};
    
    for (const [fieldId, raw] of Object.entries(productProps)) {
      if (!optionFieldIds.has(fieldId)) continue;
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (value != null && value !== '') {
        propertiesData[fieldId] = [String(value)];
      }
    }

    const member: ISimilarityProduct = {
      _id: product._id,
      code: product.code ?? '',
      name: product.name,
      unitPrice: product.unitPrice,
      propertiesData: product.propertiesData,
    };

    return {
      _id: '',
      info,
      propertiesData,
      products: [member],
      starProductId: product._id,
    };
  }, [product, fields]);

  if (!open) return null;

  return (
    <BulkProductSheetForm
      open
      onOpenChange={onOpenChange}
      similarity={initialSimilarity}
      saving={loading}
      onSave={add}
      callBack={callBack}
    />
  );
};
