import React from 'react';
import { Button, Card, cn } from 'erxes-ui';
import { IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import { SlotCardProps } from '../types';

const SlotCard: React.FC<SlotCardProps> = ({
  node,
  selected,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const slotLabel =
    typeof node.data.label === 'string' && node.data.label.length > 0
      ? node.data.label
      : node.id;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all',
        selected ? 'ring-2 ring-indigo-500' : '',
        node.data.disabled ? 'opacity-60' : '',
      )}
    >
      <div className="p-0">
        <div className="flex items-center p-3">
          <div className="flex-1">
            <h3 className="font-medium text-foreground">
              {node.data.label as React.ReactNode}
            </h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => onEdit(node, e)}
              aria-label={`Edit slot ${slotLabel}`}
            >
              <IconEdit className="w-4 h-4 text-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDuplicate(node.id)}
              aria-label={`Duplicate slot ${slotLabel}`}
            >
              <IconCopy className="w-4 h-4 text-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(node.id)}
              aria-label={`Delete slot ${slotLabel}`}
            >
              <IconTrash className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SlotCard;
