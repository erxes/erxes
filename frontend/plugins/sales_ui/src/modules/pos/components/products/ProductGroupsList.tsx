import { Card } from 'erxes-ui';
import { ProductGroup } from '@/pos/pos-detail/types/IPos';
import { AddGroupForm } from '@/pos/components/products/AddGroupForm';
import { useProductGroups } from '@/pos/hooks/useProductGroups';
import { usePosEditProductGroup } from '@/pos/hooks/usePosEditProductGroup';

interface ProductGroupsListProps {
  posId?: string;
}

export const ProductGroupsList: React.FC<ProductGroupsListProps> = ({
  posId,
}) => {
  const { productGroups, loading, error } = useProductGroups(posId);
  const { productGroupSave } = usePosEditProductGroup();

  const existingGroup = productGroups?.[0] || null;

  const handleGroupSave = async (group: ProductGroup) => {
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
  };

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
    />
  );
};
