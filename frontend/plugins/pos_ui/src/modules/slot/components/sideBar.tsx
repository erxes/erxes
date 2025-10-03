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
    <div className="m-0 border rounded-lg border-gray-200">
      <div className="p-4 border rounded-t-lg bg-gray-300 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-2xl text-[#A1A1AA]">ALL SLOTS</h2>
        <Badge variant="default">{nodes.length}</Badge>
      </div>

      <ScrollArea className="h-[calc(100vh-10rem)]">
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
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No slots available</p>
              <Button onClick={onAddSlot}>
                <IconPlus className="h-4 w-4 mr-2" />
                Add your first slot
              </Button>
            </div>
          )}

          {nodes.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={onAddSlot}
            >
              <IconPlus className="h-4 w-4 mr-2" />
              Add slot
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidebarList;
