import { useState, useEffect } from 'react';
import { Button, Label, toast } from 'erxes-ui';
import { SelectProduct } from 'ui-modules';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface KioskExcludeProductsProps {
  posId?: string;
}

export const KioskExcludeProducts: React.FC<KioskExcludeProductsProps> = ({
  posId,
}) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);

  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail) {
      setSelectedCategoryIds(posDetail.kioskExcludeCategoryIds || []);
      setSelectedProductIds(posDetail.kioskExcludeProductIds || []);
      setHasChanges(false);
    }
  }, [posDetail]);

  const handleCategorySelect = (value: string | string[]) => {
    setSelectedCategoryIds(Array.isArray(value) ? value : value ? [value] : []);
    setHasChanges(true);
  };

  const handleProductSelect = (value: string | string[]) => {
    const ids = Array.isArray(value) ? value : [value];
    setSelectedProductIds(ids);
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
          kioskExcludeCategoryIds: selectedCategoryIds,
          kioskExcludeProductIds: selectedProductIds,
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

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Categories</Label>
        <SelectCategory
          mode="multiple"
          value={selectedCategoryIds}
          onValueChange={handleCategorySelect}
          placeholder="Select categories to exclude"
        />
      </div>

      <div className="space-y-2">
        <Label>Products</Label>
        <SelectProduct
          value={selectedProductIds}
          onValueChange={handleProductSelect}
          mode="multiple"
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
