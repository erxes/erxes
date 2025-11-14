import { AutomationNodeType } from '@/automations/types';
import { Card, cn, Command, IconComponent } from 'erxes-ui';
import React from 'react';
import {
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

interface NodeLibraryRowProps {
  item: IAutomationsTriggerConfigConstants | IAutomationsActionConfigConstants;
  nodeType: AutomationNodeType;
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    { type, label, description, icon, isCustom }: any,
  ) => void;
}

export const NodeLibraryRow = ({
  item,
  onDragStart,
  nodeType,
}: NodeLibraryRowProps) => {
  const { icon: iconName, label, description } = item;

  return (
    <Command.Item value={label} asChild>
      <Card
        className={cn(
          `cursor-pointer border-accent cursor-grab hover:bg-accent transition-colors h-16 mb-2 w-[350px] sm:w-[500px]`,
          {
            'hover:border-success': nodeType === AutomationNodeType.Action,
            'hover:border-primary': nodeType === AutomationNodeType.Trigger,
          },
        )}
        draggable
        onDragStart={(event) => onDragStart(event, { nodeType, ...item })}
      >
        <Card.Content className="p-3">
          <div className="flex items-center gap-4">
            <div
              className={cn(`p-3 rounded-lg`, {
                'bg-success/10 text-success border-success':
                  nodeType === AutomationNodeType.Action,
                'bg-primary/10 text-primary border-primary':
                  nodeType === AutomationNodeType.Trigger,
              })}
            >
              <IconComponent name={iconName} />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-4">
                <h3 className="font-semibold text-foreground text-sm">
                  {label || ''}
                </h3>
              </div>
              <p className="text-accent-foreground leading-relaxed text-xs">
                {description || ''}
              </p>
            </div>
          </div>
        </Card.Content>
      </Card>
    </Command.Item>
  );
};
