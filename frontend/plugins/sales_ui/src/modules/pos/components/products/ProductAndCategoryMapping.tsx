import { useState, useEffect } from 'react';
import { Button, Card, toast } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { CatProd } from '../../pos-detail/types/IPos';
import { AddMappingSheet } from './AddMappingSheet';
import { usePosDetail } from '../../hooks/usePosDetail';
import { useMutation } from '@apollo/client';
import mutations from '../../graphql/mutations';

interface ProductAndCategoryMappingProps {
  posId?: string;
}

export const ProductAndCategoryMapping: React.FC<
  ProductAndCategoryMappingProps
> = ({ posId }) => {
  const [editingMapping, setEditingMapping] = useState<CatProd | null>(null);
  const [localMappings, setLocalMappings] = useState<CatProd[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const { posDetail, loading: detailLoading } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  useEffect(() => {
    if (posDetail?.catProdMappings) {
      setLocalMappings(posDetail.catProdMappings);
    }
  }, [posDetail]);

  const handleEdit = (mapping: CatProd) => {
    setEditingMapping(mapping);
  };

  const handleMappingAdded = (mapping: CatProd) => {
    setLocalMappings((prev) => [...prev, mapping]);
    setHasChanges(true);
  };

  const handleMappingUpdated = (updatedMapping: CatProd) => {
    setLocalMappings((prev) =>
      prev.map((m) => (m._id === updatedMapping._id ? updatedMapping : m)),
    );
    setHasChanges(true);
  };

  const handleDelete = (mappingId: string) => {
    setLocalMappings((prev) => prev.filter((m) => m._id !== mappingId));
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
      const cleanedMappings = localMappings.map((m) => {
        const { __typename, ...rest } = m as CatProd & { __typename?: string };
        return {
          _id: rest._id,
          categoryId: rest.categoryId,
          code: rest.code || '',
          name: rest.name || '',
          productId: rest.productId,
        };
      });

      await posEdit({
        variables: {
          _id: posId,
          catProdMappings: cleanedMappings,
        },
      });

      toast({
        title: 'Success',
        description: 'Product & category mappings saved successfully',
      });

      setHasChanges(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save product & category mappings',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
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
          Map product categories to specific products based on code and name
          patterns
        </p>
        <AddMappingSheet
          posId={posId}
          onMappingAdded={handleMappingAdded}
          onMappingUpdated={handleMappingUpdated}
          editingMapping={editingMapping}
          onEditComplete={() => setEditingMapping(null)}
        />
      </div>

      {!localMappings || localMappings.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No mappings found. Create your first mapping to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {localMappings.map((mapping) => (
            <div
              key={mapping._id}
              className="flex justify-between items-center p-3 rounded-lg border"
            >
              <span className="text-sm">
                {mapping.name || mapping.categoryId}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleEdit(mapping)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => mapping._id && handleDelete(mapping._id)}
                  className="text-destructive"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
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
