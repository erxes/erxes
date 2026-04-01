import { useState, useEffect } from 'react';
import { Button, Label, toast } from 'erxes-ui';
import { SelectCategory } from '@/pos/hooks/SelectCategory';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface InitialProductCategoriesProps {
  posId?: string;
}

export const InitialProductCategories: React.FC<
  InitialProductCategoriesProps
> = ({ posId }) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);

  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (hasChanges || selectedCategoryIds.length) {
      return;
    }

    if (posDetail?.initialCategoryIds?.length) {
      setSelectedCategoryIds(posDetail.initialCategoryIds);
    }
  }, [posDetail, hasChanges, selectedCategoryIds]);

  const handleCategorySelect = (value: string | string[]) => {
    setSelectedCategoryIds(Array.isArray(value) ? value : value ? [value] : []);
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

    if (!selectedCategoryIds.length) {
      toast({
        title: 'Error',
        description: 'Please select categories',
        variant: 'destructive',
      });
      return;
    }

    try {
      await posEdit({
        variables: {
          _id: posId,
          initialCategoryIds: selectedCategoryIds,
        },
      });

      toast({
        title: 'Success',
        description: 'Initial product categories saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save initial product categories',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return <div className="h-10 rounded animate-pulse bg-background" />;
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
        <Label>Product Categories</Label>
        <SelectCategory
          mode="multiple"
          value={selectedCategoryIds}
          onValueChange={handleCategorySelect}
          placeholder="Select initial product categories"
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
