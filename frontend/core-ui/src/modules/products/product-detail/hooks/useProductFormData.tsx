import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { ProductDetail } from '../types/detailTypes';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

const normalizeBarcodes = (barcodes: any): string[] => {
  if (Array.isArray(barcodes)) return barcodes;
  if (barcodes) return [barcodes];
  return [];
};

export const useProductFormData = (
  productDetail: ProductDetail | null,
  form: UseFormReturn<ProductFormValues>,
) => {
  useEffect(() => {
    if (productDetail) {
      form.reset({
        name: productDetail.name || '',
        code: productDetail.code || '',
        barcodes: normalizeBarcodes(productDetail.barcodes),
        categoryId: productDetail.categoryId || '',
        type: productDetail.type || '',
        status: productDetail.status || '',
        uom: productDetail.uom || '',
        shortName: productDetail.shortName || '',
        description: productDetail.description || '',
        barcodeDescription: productDetail.barcodeDescription || '',
        vendorId: productDetail.vendorId || '',
        scopeBrandIds: productDetail.scopeBrandIds || [],
        unitPrice: productDetail.unitPrice || 0,
      });
    }
  }, [productDetail, form]);
};