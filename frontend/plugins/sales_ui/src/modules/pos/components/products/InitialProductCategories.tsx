import { useState, useEffect } from 'react';
import { Button, Label, toast } from 'erxes-ui';
import { SelectCategory } from 'ui-modules';
import { useMutation } from '@apollo/client';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import mutations from '@/pos/graphql/mutations';

interface InitialProductCategoriesProps {
  posId?: string;
}

export const InitialProductCategories: React.FC<
  InitialProductCategoriesProps
> = ({ posId }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);

  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (hasChanges || selectedCategoryId) {
      return;
    }

    if (posDetail?.initialCategoryIds?.length) {
      setSelectedCategoryId(posDetail.initialCategoryIds[0]);
    }
  }, [posDetail, hasChanges, selectedCategoryId]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
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

    if (!selectedCategoryId) {
      toast({
        title: 'Error',
        description: 'Please select a category',
        variant: 'destructive',
      });
      return;
    }

    try {
      await posEdit({
        variables: {
          _id: posId,
          initialCategoryIds: [selectedCategoryId],
        },
      });

      toast({
        title: 'Success',
        description: 'Initial product category saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save initial product category',
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
        <Label>Product Category</Label>
        <SelectCategory
          selected={selectedCategoryId}
          onSelect={handleCategorySelect as any}
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
