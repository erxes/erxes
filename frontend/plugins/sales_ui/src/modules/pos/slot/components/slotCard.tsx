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
        'overflow-hidden transition-all hover:shadow-md',
        selected ? 'ring-2 ring-indigo-500' : '',
        node.data.disabled ? 'opacity-60' : '',
      )}
    >
      <div className="p-0">
        <div className="flex items-center p-3">
          <div className="flex-1">
            <h3 className="font-medium">
              {node.data.label as React.ReactNode}
            </h3>
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-100 hover:bg-gray-200"
              onClick={(e) => onEdit(node, e)}
            >
              <IconEdit className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-100 hover:bg-gray-200"
              onClick={() => onDuplicate(node.id)}
            >
              <IconCopy className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="bg-gray-100 hover:bg-gray-200"
              onClick={() => onDelete(node.id)}
            >
              <IconTrash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SlotCard;
