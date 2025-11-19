import React from 'react';
import { Button, Card } from 'erxes-ui';
import { IconEdit, IconTrash, IconCopy } from '@tabler/icons-react';
import { cn } from 'erxes-ui/lib';
import { SlotCardProps } from '../types';

const SlotCard: React.FC<SlotCardProps> = ({
  node,
  selected,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
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
            >
              <IconEdit className="w-4 h-4 text-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDuplicate(node.id)}
            >
              <IconCopy className="w-4 h-4 text-foreground" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(node.id)}
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
