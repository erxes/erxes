import { useState, useEffect } from 'react';
import { Button, Card, toast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { ProductGroup } from '../../pos-detail/types/IPos';
import { AddGroupSheet } from './AddGroupSheet';
import { useProductGroups } from '../../hooks/useProductGroups';
import { usePosEditProductGroup } from '../../hooks/usePosEditProductGroup';

interface ProductGroupsListProps {
  posId?: string;
}

export const ProductGroupsList: React.FC<ProductGroupsListProps> = ({
  posId,
}) => {
  const [editingGroup, setEditingGroup] = useState<ProductGroup | null>(null);
  const [localGroups, setLocalGroups] = useState<ProductGroup[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { productGroups, loading, error, refetch } = useProductGroups(posId);
  const { productGroupSave, loading: saving } = usePosEditProductGroup();

  useEffect(() => {
    if (productGroups) {
      setLocalGroups(productGroups);
    }
  }, [productGroups]);

  const handleEdit = (group: ProductGroup) => {
    setEditingGroup(group);
  };

  const handleGroupAdded = (group: ProductGroup) => {
    setLocalGroups((prev) => [...prev, group]);
    setHasChanges(true);
  };

  const handleGroupUpdated = (updatedGroup: ProductGroup) => {
    setLocalGroups((prev) =>
      prev.map((g) => (g._id === updatedGroup._id ? updatedGroup : g)),
    );
    setHasChanges(true);
  };

  const handleDelete = (groupId: string) => {
    setLocalGroups((prev) => prev.filter((g) => g._id !== groupId));
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
      await productGroupSave(
        {
          variables: {
            posId,
            groups: localGroups,
          },
        },
        ['groups'],
      );

      toast({
        title: 'Success',
        description: 'Product groups saved successfully',
      });

      setHasChanges(false);
      refetch();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save product groups',
        variant: 'destructive',
      });
    }
  };

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load product groups: {error.message}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="mb-2 w-1/4 h-4 rounded bg-background"></div>
            <div className="w-3/4 h-3 rounded bg-background"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Manage product groups for your POS system
        </p>
        <AddGroupSheet
          posId={posId}
          onGroupAdded={handleGroupAdded}
          onGroupUpdated={handleGroupUpdated}
          editingGroup={editingGroup}
          onEditComplete={() => setEditingGroup(null)}
        />
      </div>

      {!localGroups || localGroups.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>
            No product groups found. Create your first group to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {localGroups.map((group) => (
            <Card key={group._id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(group)}
                  >
                    <IconEdit size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => group._id && handleDelete(group._id)}
                    className="text-destructive"
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

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
