import { useState, useEffect } from 'react';
import { Button, Label, toast } from 'erxes-ui';
import { SelectCategory, SelectProduct } from 'ui-modules';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '../../hooks/usePosDetail';
import mutations from '../../graphql/mutations';

interface KioskExcludeProductsProps {
  posId?: string;
}

export const KioskExcludeProducts: React.FC<KioskExcludeProductsProps> = ({
  posId,
}) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading } = usePosDetail(posId);

  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.kioskExcludeCategoryIds?.length) {
      setSelectedCategoryId(posDetail.kioskExcludeCategoryIds[0]);
    }
    if (posDetail?.kioskExcludeProductIds?.length) {
      setSelectedProductId(posDetail.kioskExcludeProductIds[0]);
    }
  }, [posDetail]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setHasChanges(true);
  };

  const handleProductSelect = (productId: string | string[]) => {
    const id = Array.isArray(productId) ? productId[0] : productId;
    setSelectedProductId(id || '');
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await posEdit({
        variables: {
          _id: posId,
          kioskExcludeCategoryIds: selectedCategoryId
            ? [selectedCategoryId]
            : [],
          kioskExcludeProductIds: selectedProductId ? [selectedProductId] : [],
        },
      });

      toast({
        title: 'Success',
        description: 'Kiosk exclude settings saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save kiosk exclude settings',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 rounded animate-pulse bg-background" />
        <div className="h-10 rounded animate-pulse bg-background" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <SelectCategory
          selected={selectedCategoryId}
          onSelect={
            handleCategorySelect as unknown as React.ReactEventHandler<HTMLButtonElement> &
              ((categoryId: string) => void)
          }
        />
      </div>

      <div className="space-y-2">
        <Label>Products</Label>
        <SelectProduct
          value={selectedProductId}
          onValueChange={handleProductSelect}
          mode="single"
        />
      </div>

      {hasChanges && (
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSaveChanges} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
};
