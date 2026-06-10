import { useLayoutEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductDetail } from '../types/detailTypes';
import {
  EMPTY_PRODUCT_FORM_VALUES,
  ProductFormValues,
} from '@/products/constants/ProductFormSchema';
import { IUom, uomToId } from 'ui-modules';
import { useUom } from '@/products/hooks/useUom';

const normalizeBarcodes = (barcodes: any): string[] => {
  if (Array.isArray(barcodes)) return barcodes;
  if (barcodes) return [barcodes];
  return [];
};

function toSingleAttachment(att: unknown): Record<string, unknown> | undefined {
  if (att == null) return undefined;
  if (Array.isArray(att)) {
    const first = att[0];
    return first != null && typeof first === 'object'
      ? (first as Record<string, unknown>)
      : undefined;
  }
  return typeof att === 'object' && att !== null
    ? (att as Record<string, unknown>)
    : undefined;
}

function toAttachmentMore(att: unknown): unknown[] | string | undefined {
  if (att == null) return undefined;
  if (Array.isArray(att)) return att;
  if (typeof att === 'string') return att;
  if (typeof att === 'object') return [att];
  return undefined;
}

function toVariantsRecord(v: unknown): Record<string, unknown> {
  if (v != null && typeof v === 'object' && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return {};
}

function toUomValue(uom: unknown): string {
  if (typeof uom === 'string') return uom;
  if (uom != null && typeof uom === 'object' && '_id' in uom) {
    const id = (uom as { _id?: string })._id;
    return typeof id === 'string' ? id : '';
  }
  return '';
}

export function getProductFormDefaultValues(
  productDetail: ProductDetail | null,
  uoms: IUom[] = [],
): ProductFormValues | null {
  if (!productDetail) return null;
  return {
    name: productDetail.name || '',
    code: productDetail.code || '',
    barcodes: normalizeBarcodes(productDetail.barcodes),
    categoryId: productDetail.categoryId || '',
    type: productDetail.type || '',
    status: productDetail.status || '',
    uom: uomToId(uoms, toUomValue(productDetail.uom)),
    shortName: productDetail.shortName || '',
    description: productDetail.description || '',
    barcodeDescription: productDetail.barcodeDescription || '',
    vendorId: productDetail.vendorId || '',
    scopeBrandIds: productDetail.scopeBrandIds || [],
    unitPrice: productDetail.unitPrice ?? 0,
    attachment: toSingleAttachment(productDetail.attachment),
    attachmentMore: toAttachmentMore(productDetail.attachmentMore),
    customFieldsData:
      productDetail.customFieldsData || productDetail.propertiesData || {},
    currency: productDetail.currency || '',
    variants: toVariantsRecord(productDetail.variants),
    subUoms: (productDetail.subUoms || []).map((subUom) => ({
      ...subUom,
      uom: uomToId(uoms, toUomValue(subUom?.uom)),
    })),
  };
}

export const useProductFormData = (
  productDetail: ProductDetail | null,
  form: UseFormReturn<ProductFormValues>,
  productId?: string,
) => {
  const [formVersion, setFormVersion] = useState(0);
  const { uoms } = useUom({});

  useLayoutEffect(() => {
    form.reset(EMPTY_PRODUCT_FORM_VALUES);
    setFormVersion((version) => version + 1);
  }, [form, productId]);

  useLayoutEffect(() => {
    const defaults = getProductFormDefaultValues(productDetail, uoms);
    if (defaults && (!productId || productDetail?._id === productId)) {
      form.reset(defaults);
      setFormVersion((version) => version + 1);
    }
  }, [productDetail, form, productId, uoms]);

  return formVersion;
};
