import React from 'react';
import { Button, Tooltip, Spinner } from 'erxes-ui';
import { Panel } from '@xyflow/react';
import {
  IconPlus,
  IconArrowsMoveVertical,
  IconDeviceFloppy,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { NodeControlsProps } from '../types';

const NodeControls = React.forwardRef<HTMLButtonElement, NodeControlsProps>(
  (
    {
      onAddSlot,
      onArrangeNodes,
      onSaveChanges,
      isCreating,
      saving,
      onOpenSlots,
    },
    slotsButtonRef,
  ) => {
    return (
      <Panel position="top-right" className="flex flex-col items-end gap-2">
        <div className="relative p-2 border rounded-md bg-background">
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
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onArrangeNodes}
                  >
                    <IconArrowsMoveVertical className="w-4 h-4 text-foreground" />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <p>Auto-arrange Layout</p>
                </Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>

            {onOpenSlots && (
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button
                      ref={slotsButtonRef}
                      variant="outline"
                      size="icon"
                      aria-label="Open Slots"
                      onClick={onOpenSlots}
                    >
                      <IconLayoutSidebarRightExpand className="w-4 h-4" />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <p>Open Slots</p>
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            )}
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
        </div>
      </Panel>
    );
  },
);

NodeControls.displayName = 'NodeControls';

export default NodeControls;
