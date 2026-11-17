import {
  IProductSimilarity,
  ISimilarityInfo,
  ISimilarityProduct,
} from '@/products/bulk-similarity/types';
import {
  ProductAttachment,
  ProductDetail,
} from '@/products/product-detail/types/detailTypes';

type TOptionField = { _id: string; options?: unknown[] | null };

// The secondary images as a list, however the product holds them.
const toAttachmentList = (
  attachmentMore: ProductDetail['attachmentMore'],
): ProductAttachment[] | undefined => {
  if (Array.isArray(attachmentMore)) return attachmentMore;
  return attachmentMore ? [attachmentMore] : undefined;
};

const toSimilarityInfo = (product: ProductDetail): ISimilarityInfo => {
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
    attachmentMore: toAttachmentList(product.attachmentMore),
  };

  return Object.fromEntries(
    Object.entries(candidate).filter(
      ([, value]) => value != null && value !== '',
    ),
  ) as ISimilarityInfo;
};

/**
 * A new similarity group started from a product: its info, its values of
 * the option fields as the first variant, and the product as that variant.
 */
export const buildProductSimilarityDraft = (
  product: ProductDetail,
  fields: TOptionField[],
): IProductSimilarity => {
  const info = toSimilarityInfo(product);
  if (!product._id) return { _id: '', info, propertiesData: {} };

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
};
