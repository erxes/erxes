import React from 'react';
import { Button, Tooltip } from 'erxes-ui';
import { Panel } from '@xyflow/react';
import { IconPlus, IconArrowsMoveVertical } from '@tabler/icons-react';
import { NodeControlsProps } from '../types';

const NodeControls: React.FC<NodeControlsProps> = ({
  onAddSlot,
  onArrangeNodes,
}) => {
  return (
    <Panel
      position="top-right"
      className="bg-white dark:bg-gray-800 p-2 rounded-md shadow-md border border-gray-200 dark:border-gray-700"
    >
      <div className="flex flex-col gap-2">
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="outline" size="icon" onClick={onAddSlot}>
                <IconPlus className="h-4 w-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Add New Slot (Ctrl+N)</p>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="outline" size="icon" onClick={onArrangeNodes}>
                <IconArrowsMoveVertical className="h-4 w-4" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Auto-arrange Layout</p>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>
      </div>
    </Panel>
  );
};

export default NodeControls;
