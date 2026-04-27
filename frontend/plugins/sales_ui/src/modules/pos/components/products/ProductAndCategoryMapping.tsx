import { useState } from 'react';
import { Button } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import { type CatProd } from '@/pos/pos-detail/types/IPos';
import { AddMappingSheet } from '@/pos/components/products/AddMappingSheet';

interface ProductAndCategoryMappingProps {
  mappings: CatProd[];
  onMappingAdded: (mapping: CatProd) => void;
  onMappingUpdated: (mapping: CatProd) => void;
  onMappingDeleted: (mappingId: string) => void;
}

export const ProductAndCategoryMapping: React.FC<
  ProductAndCategoryMappingProps
> = ({ mappings, onMappingAdded, onMappingUpdated, onMappingDeleted }) => {
  const [editingMapping, setEditingMapping] = useState<CatProd | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Map product categories to specific products based on code and name
          patterns
        </p>
        <AddMappingSheet
          onMappingAdded={onMappingAdded}
          onMappingUpdated={onMappingUpdated}
          editingMapping={editingMapping}
          onEditComplete={() => setEditingMapping(null)}
        />
      </div>

      {!mappings || mappings.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <p>No mappings found. Create your first mapping to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {mappings.map((mapping) => (
            <div
              key={mapping._id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <span className="text-sm">
                {mapping.name || mapping.categoryId}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setEditingMapping(mapping)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onMappingDeleted(mapping._id)}
                  className="text-destructive"
                >
                  <IconTrash size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
