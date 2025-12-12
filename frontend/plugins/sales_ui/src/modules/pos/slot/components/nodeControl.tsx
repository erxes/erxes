import React from 'react';
import { Button, Tooltip, Spinner } from 'erxes-ui';
import { Panel } from '@xyflow/react';
import {
  IconPlus,
  IconArrowsMoveVertical,
  IconDeviceFloppy,
} from '@tabler/icons-react';
import { NodeControlsProps } from '../types';

const NodeControls: React.FC<NodeControlsProps> = ({
  onAddSlot,
  onArrangeNodes,
  onSaveChanges,
  isCreating,
  saving,
}) => {
  return (
    <Panel position="top-right" className="p-2 rounded-md border bg-background">
      <div className="flex flex-col gap-2">
        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="outline" size="icon" onClick={onAddSlot}>
                <IconPlus className="w-4 h-4 text-foreground" />
              </Button>
            </Tooltip.Trigger>

            <Tooltip.Content>
              <p>Add New Slot</p>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>

        <Tooltip.Provider>
          <Tooltip>
            <Tooltip.Trigger asChild>
              <Button variant="outline" size="icon" onClick={onArrangeNodes}>
                <IconArrowsMoveVertical className="w-4 h-4 text-foreground" />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <p>Auto-arrange Layout</p>
            </Tooltip.Content>
          </Tooltip>
        </Tooltip.Provider>

        {onSaveChanges && !isCreating && (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  onClick={onSaveChanges}
                  disabled={saving}
                >
                  {saving ? (
                    <Spinner size="sm" />
                  ) : (
                    <IconDeviceFloppy className="w-4 h-4 text-foreground" />
                  )}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                <p>{saving ? 'Saving...' : 'Save Changes'}</p>
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
      </div>
    </Panel>
  );
};

export default NodeControls;
