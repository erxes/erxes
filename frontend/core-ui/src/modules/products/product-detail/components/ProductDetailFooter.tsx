import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { Button } from 'erxes-ui';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ProductDetailFooterProps {
  form: UseFormReturn<ProductFormValues>;
  activeTab: string;
  onCancel?: () => void;
  onSave?: () => void;
  editLoading?: boolean;
}

export const ProductDetailFooter: React.FC<ProductDetailFooterProps> = ({
  form,
  activeTab,
  onCancel,
  onSave,
  editLoading = false,
}) => {
  const handleCancel = () => {
    if (form && typeof form.reset === 'function') {
      form.reset();
    }
    if (onCancel) {
      onCancel();
    }
  };

  const handleSaveClick = () => {
    if (onSave) onSave();
  };

  if (activeTab === 'properties') {
    return null;
  }

  return (
    <div className="flex justify-end p-4 space-x-2 border-t bg-background">
      <Button variant="outline" onClick={handleCancel} type="button">
        Cancel
      </Button>
      <Button
        type="button"
        disabled={editLoading}
        onClick={handleSaveClick}
        variant="default"
      >
        {editLoading ? 'Saving...' : 'Save Details'}
      </Button>
    </div>
  );
};
