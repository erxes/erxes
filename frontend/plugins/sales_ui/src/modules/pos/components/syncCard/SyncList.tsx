import { Button } from 'erxes-ui';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { FieldArrayWithId } from 'react-hook-form';
import {
  AddConfigSheet,
  CardConfig,
} from '@/pos/components/syncCard/AddConfigSheet';
import type { SyncCardFormData } from './SyncCard';

interface SyncListProps {
  fields: FieldArrayWithId<SyncCardFormData, 'configs', 'id'>[];
  onConfigAdded: (config: CardConfig) => void;
  onConfigUpdated: (config: CardConfig) => void;
  onDelete: (index: number) => void;
  onEdit: (config: CardConfig) => void;
  editingConfig: CardConfig | null;
  onEditComplete: () => void;
}

export const SyncList: React.FC<SyncListProps> = ({
  fields,
  onConfigAdded,
  onConfigUpdated,
  onDelete,
  onEdit,
  editingConfig,
  onEditComplete,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddConfigSheet
          onConfigAdded={onConfigAdded}
          onConfigUpdated={onConfigUpdated}
          editingConfig={editingConfig}
          onEditComplete={onEditComplete}
        />
      </div>

      {fields.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          No configurations yet. Click "Add Config" to add one.
        </div>
      ) : (
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={field.id || `${field.branchId}_${index}`}
              className="flex justify-between items-center p-4 rounded-lg border"
            >
              <div>
                <div className="font-medium">
                  {(field as unknown as CardConfig).title || 'Untitled'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(field as unknown as CardConfig)}
                >
                  <IconEdit size={16} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(index)}
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
