import { FileUploadSection } from './FileUploadSection';
import { ProductBasicFields } from './ProductBasicField';
import { ProductEditorField } from './ProductEditor';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { ProductHotKeyScope } from '@/products/types/ProductsHotKeyScope';
import type React from 'react';
import { Spinner } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useProductDetail } from '../hooks/useProductDetail';
import { useProductFormData } from '../hooks/useProductFormData';
import { useUom } from '@/products/hooks/useUom';

interface ProductDetailFormProps {
  form: UseFormReturn<ProductFormValues>;
}

export const ProductDetailForm: React.FC<ProductDetailFormProps> = ({
  form,
}) => {
  const { productDetail, loading, error } = useProductDetail();
  const { uoms } = useUom({});

  useProductFormData(productDetail, form);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
        <div className="text-red-500 text-center">
          <h3 className="text-lg font-semibold mb-2">Error Loading Product</h3>
          <p className="text-sm text-muted-foreground">
            {error.message ||
              'Failed to load product details. Please try again.'}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 overflow-y-auto max-h-[calc(100vh-100px)] bg-white rounded-lg pb-24">
      <ProductBasicFields control={form.control} uoms={uoms} />
      <ProductEditorField
        control={form.control}
        setValue={form.setValue}
        name="description"
        label="DESCRIPTION"
        initialContent={productDetail?.description}
        scope={ProductHotKeyScope.ProductAddSheetDescriptionField}
      />

      <ProductEditorField
        control={form.control}
        setValue={form.setValue}
        name="barcodeDescription"
        label="BARCODE DESCRIPTION"
        initialContent={productDetail?.barcodeDescription}
        scope={ProductHotKeyScope.ProductAddSheetBarcodeDescriptionField}
      />

      <FileUploadSection label="FEATURED IMAGE" buttonText="Upload Image" />

      <FileUploadSection
        label="SECONDARY IMAGES"
        buttonText="Upload Images"
        variant="secondary"
      />
    </div>
  );
};
