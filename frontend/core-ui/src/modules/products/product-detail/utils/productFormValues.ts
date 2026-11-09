import { toProductAttachmentList } from 'ui-modules/modules/products/components/ProductImageUploads';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { ProductDetail } from '@/products/product-detail/types/detailTypes';

type TAttachmentInput = {
  url?: string;
  name?: string;
  type?: string;
  size?: number;
  duration?: number;
};

const normalizeBarcodes = (barcodes: ProductDetail['barcodes']): string[] => {
  if (Array.isArray(barcodes)) return barcodes;
  if (barcodes) return [barcodes];
  return [];
};

const toSingleAttachment = (
  att: unknown,
): Record<string, unknown> | undefined => {
  if (att == null) return undefined;
  if (Array.isArray(att)) {
    const first = att[0];
    return first != null && typeof first === 'object'
      ? (first as Record<string, unknown>)
      : undefined;
  }
  return typeof att === 'object' ? (att as Record<string, unknown>) : undefined;
};

const toAttachmentMore = (att: unknown): unknown[] | string | undefined => {
  if (att == null) return undefined;
  if (Array.isArray(att)) return att;
  if (typeof att === 'string') return att;
  if (typeof att === 'object') return [att];
  return undefined;
};

const toVariantsRecord = (v: unknown): Record<string, unknown> =>
  v != null && typeof v === 'object' && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {};

const toUomValue = (uom: unknown): string => {
  if (typeof uom === 'string') return uom;
  if (uom != null && typeof uom === 'object' && '_id' in uom) {
    const id = (uom as { _id?: string })._id;
    return typeof id === 'string' ? id : '';
  }
  return '';
};

/** The product as edit form values: the base every save starts from. */
export const getProductFormDefaultValues = (
  productDetail: ProductDetail | null,
): ProductFormValues | null => {
  if (!productDetail) return null;
  return {
    name: productDetail.name || '',
    code: productDetail.code || '',
    barcodes: normalizeBarcodes(productDetail.barcodes),
    categoryId: productDetail.categoryId || '',
    type: productDetail.type || '',
    status: productDetail.status || '',
    uom: toUomValue(productDetail.uom),
    shortName: productDetail.shortName || '',
    description: productDetail.description || '',
    barcodeDescription: productDetail.barcodeDescription || '',
    vendorId: productDetail.vendorId || '',
    conditionCodes: productDetail.conditionCodes || [],
    scopeBrandIds: productDetail.scopeBrandIds || [],
    unitPrice: productDetail.unitPrice ?? 0,
    weight: productDetail.weight,
    attachment: toSingleAttachment(productDetail.attachment),
    attachmentMore: toAttachmentMore(productDetail.attachmentMore),
    videos: toAttachmentMore(productDetail.videos),
    files: toProductAttachmentList(productDetail.files),
    customFieldsData:
      productDetail.customFieldsData || productDetail.propertiesData || {},
    currency: productDetail.currency || '',
    duration: productDetail.duration,
    durationType: productDetail.durationType,
    variants: toVariantsRecord(productDetail.variants),
    subUoms: (productDetail.subUoms || []).map((subUom) => ({
      ...subUom,
      uom: toUomValue(subUom?.uom),
    })),
  };
};

const toAttachmentInput = (obj: unknown): TAttachmentInput | undefined => {
  if (obj == null || typeof obj !== 'object') return undefined;
  const { url, name, type, size, duration } = obj as Record<string, unknown>;
  return {
    url: url as string | undefined,
    name: name as string | undefined,
    type: type as string | undefined,
    size: size as number | undefined,
    // Only videos have one; `AttachmentInput` takes it.
    ...(typeof duration === 'number' && { duration }),
  };
};

// Cached attachments carry `__typename`, which `AttachmentInput` rejects.
const toAttachmentInputs = (value: unknown): TAttachmentInput[] | undefined =>
  Array.isArray(value)
    ? value
        .map(toAttachmentInput)
        .filter((x): x is TAttachmentInput => x != null)
    : undefined;

const normalizeSubUomRatio = (ratio: number | string | undefined): number => {
  if (typeof ratio === 'number' && Number.isFinite(ratio) && ratio > 0)
    return ratio;
  const num = Number(ratio);
  return Number.isFinite(num) && num > 0 ? num : 1;
};

/**
 * Form values as `productsEdit` variables (attachments as AttachmentInput).
 * Conditions are left out: only their own toggle changes them, so a field
 * save never sends back codes it read before a toggle.
 */
export const toProductEditVariables = (values: ProductFormValues) => {
  const data = { ...values };
  delete data.conditionCodes;
  // `null`, not a missing variable, so a removed featured image is cleared.
  const attachment =
    data.attachment != null && !Array.isArray(data.attachment)
      ? toAttachmentInput(data.attachment) ?? null
      : null;
  const attachmentMore = toAttachmentInputs(data.attachmentMore);
  const videos = toAttachmentInputs(data.videos);
  const subUoms = Array.isArray(data.subUoms)
    ? data.subUoms.map((item) => ({
        ...item,
        uom: item?.uom,
        ratio: normalizeSubUomRatio(item?.ratio),
      }))
    : data.subUoms;

  return { ...data, attachment, attachmentMore, videos, subUoms };
};
