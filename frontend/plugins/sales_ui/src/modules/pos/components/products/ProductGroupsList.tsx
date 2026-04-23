import { useCallback, useEffect, useState } from 'react';
import { Card } from 'erxes-ui';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { AddGroupForm } from '@/pos/components/products/AddGroupForm';
import { useProductGroups } from '@/pos/hooks/useProductGroups';
import { usePosEditProductGroup } from '@/pos/hooks/usePosEditProductGroup';

interface ProductGroupSaveState {
  isDirty: boolean;
  saving: boolean;
  onSave: () => Promise<void>;
}

interface ProductGroupsListProps {
  posId?: string;
  onSaveStateChange?: (state: ProductGroupSaveState | null) => void;
}

export const ProductGroupsList: React.FC<ProductGroupsListProps> = ({
  posId,
  onSaveStateChange,
}) => {
  const { productGroups, loading, error } = useProductGroups(posId);
  const { productGroupSave, loading: saving } = usePosEditProductGroup();
  const [isDirty, setIsDirty] = useState(false);
  const [saveRequest, setSaveRequest] = useState<(() => Promise<void>) | null>(
    null,
  );

  const existingGroup = productGroups?.[0] || null;

  const handleGroupSave = useCallback(async (group: ProductGroup) => {
    if (!posId) return;

    await productGroupSave(
      {
        variables: {
          posId,
          groups: [group],
        },
      },
      ['groups'],
    );
  }, [posId, productGroupSave]);

  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsDirty(dirty);
  }, []);

  const handleSaveRequestChange = useCallback(
    (handler: (() => Promise<void>) | null) => {
      setSaveRequest(() => handler);
    },
    [],
  );

  useEffect(() => {
    if (!onSaveStateChange) {
      return;
    }

    onSaveStateChange(
      isDirty && saveRequest
        ? {
            isDirty,
            saving,
            onSave: saveRequest,
          }
        : null,
    );

    return () => onSaveStateChange(null);
  }, [isDirty, onSaveStateChange, saveRequest, saving]);

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load product group: {error.message}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="mb-2 w-1/4 h-4 rounded bg-background"></div>
        <div className="w-3/4 h-3 rounded bg-background"></div>
      </Card>
    );
  }

  return (
    <AddGroupForm
      editingGroup={existingGroup}
      onGroupAdded={handleGroupSave}
      onGroupUpdated={handleGroupSave}
      onDirtyChange={handleDirtyChange}
      onSaveRequestChange={handleSaveRequestChange}
    />
  );
};
