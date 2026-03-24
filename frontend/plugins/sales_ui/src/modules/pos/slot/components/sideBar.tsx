import React from 'react';
import { Badge, Button, ScrollArea } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { SidebarListProps } from '../types';
import SlotCard from './slotCard';

const SidebarList: React.FC<SidebarListProps> = ({
  nodes,
  selectedNode,
  onNodeClick,
  onAddSlot,
  onDuplicateSlot,
  onDeleteSlot,
}) => {
  return (
    <div className="bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-2xl text-foreground">ALL SLOTS</h2>

        <Badge variant="default">{nodes.length}</Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-3">
          {nodes.length > 0 ? (
            nodes.map((node) => (
              <SlotCard
                key={node.id}
                node={node}
                selected={selectedNode?.id === node.id}
                onEdit={(node, event) => {
                  if (event) onNodeClick(event, node);
                }}
                onDuplicate={onDuplicateSlot}
                onDelete={onDeleteSlot}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="mb-4 text-foreground">No slots available</p>

              <Button onClick={onAddSlot} variant="default">
                <IconPlus className="mr-2 w-4 h-4" />
                Add your first slot
              </Button>
            </div>
          )}

          {nodes.length > 0 && (
            <Button
              variant="default"
              className="mt-4 w-full"
              onClick={onAddSlot}
            >
              <IconPlus className="mr-2 w-4 h-4" />
              Add slot
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarList;
