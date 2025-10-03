import React from 'react';
import { Button } from 'erxes-ui';
import { useProductsEdit } from '@/products/hooks/useProductsEdit';
import { useProductDetail } from '../hooks/useProductDetail';
import { useToast } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

interface ProductDetailFooterProps {
  form: UseFormReturn<ProductFormValues>;
  activeTab: string;
  onCancel?: () => void;
}

export const ProductDetailFooter: React.FC<ProductDetailFooterProps> = ({
  form,
  activeTab,
  onCancel,
}) => {
  const { toast } = useToast();
  const { productDetail } = useProductDetail();

  const { productsEdit, loading: editLoading } = useProductsEdit();

  const handleSubmit = (data: ProductFormValues) => {
    if (!productDetail?._id) {
      toast({
        title: 'Error',
        description: 'Product ID is missing',
        variant: 'destructive',
      });
      return;
    }

    productsEdit({
      variables: {
        ...data,
        _id: productDetail._id,
      },
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Product updated successfully',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message || 'Failed to update product',
          variant: 'destructive',
        });
      },
    });
  };

  const handleCancel = () => {
    if (form && typeof form.reset === 'function') {
      form.reset();
    }
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex justify-end space-x-2 p-4 border-t bg-white">
      <Button variant="ghost" onClick={handleCancel} type="button">
        Cancel
      </Button>
      <Button
        type="button"
        onClick={form.handleSubmit(handleSubmit)}
        disabled={editLoading}
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {editLoading
          ? 'Saving...'
          : `Save ${activeTab === 'overview' ? 'Details' : 'Properties'}`}
      </Button>
    </div>
  );
};
