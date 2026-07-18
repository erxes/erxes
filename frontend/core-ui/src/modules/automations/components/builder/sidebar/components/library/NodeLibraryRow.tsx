import {
  useDnDActions,
  useDnDMetaState,
} from '@/automations/context/AutomationBuilderDnDProvider';
import { AutomationNodeType } from '@/automations/types';
import { cn, Command, IconComponent } from 'erxes-ui';
import React from 'react';

export type TNodeLibraryRowItem = {
  type: string;
  label: string;
  description?: string;
  icon?: string;
} & Record<string, any>;

interface NodeLibraryRowProps {
  item: TNodeLibraryRowItem;
  nodeType: AutomationNodeType;
  draggable?: boolean;
  rightElement?: React.ReactNode;
  onDragStart?: (
    event: React.DragEvent<HTMLDivElement>,
    { type, label, description, icon, isCustom }: any,
  ) => void;
  onSelectNode: (node: TNodeLibraryRowItem & { nodeType: AutomationNodeType }) => void;
}

const GHOST_COLORS: Record<
  AutomationNodeType,
  { border: string; background: string; color: string }
> = {
  [AutomationNodeType.Trigger]: {
    border: 'rgba(99,102,241,0.18)',
    background: 'rgba(99,102,241,0.10)',
    color: 'rgb(99,102,241)',
  },
  [AutomationNodeType.Action]: {
    border: 'rgba(34,197,94,0.18)',
    background: 'rgba(34,197,94,0.10)',
    color: 'rgb(34,197,94)',
  },
  [AutomationNodeType.Workflow]: {
    border: 'rgba(59,130,246,0.18)',
    background: 'rgba(59,130,246,0.10)',
    color: 'rgb(59,130,246)',
  },
};

const createDragGhost = ({
  label,
  nodeType,
  iconMarkup,
}: {
  label: string;
  nodeType: AutomationNodeType;
  iconMarkup: string;
}) => {
  const ghost = document.createElement('div');

  ghost.style.position = 'fixed';
  ghost.style.top = '-1000px';
  ghost.style.left = '-1000px';
  ghost.style.pointerEvents = 'none';
  ghost.style.zIndex = '9999';

  ghost.innerHTML = `
    <div
      style="
        display:flex;
        align-items:center;
        gap:10px;
        padding:10px 12px;
        border-radius:12px;
        border:1px solid ${GHOST_COLORS[nodeType].border};
        background:var(--background, rgba(255,255,255,0.96));
        color:var(--foreground, rgb(15,23,42));
        box-shadow:0 16px 40px rgba(15,23,42,0.16);
        min-width:160px;
        font-family:inherit;
      "
    >
      <div
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          width:32px;
          height:32px;
          border-radius:10px;
          background:${GHOST_COLORS[nodeType].background};
          color:${GHOST_COLORS[nodeType].color};
        "
      >
        ${iconMarkup}
      </div>
      <div style="display:flex;flex-direction:column;min-width:0;">
        <div style="font-size:11px;line-height:1;text-transform:uppercase;opacity:.6;">
          ${nodeType}
        </div>
        <div style="font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${label}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(ghost);

  return ghost;
};

export const NodeLibraryRow = ({
  item,
  onDragStart,
  onSelectNode,
  nodeType,
  draggable = true,
  rightElement,
}: NodeLibraryRowProps) => {
  const { icon: iconName, label, description } = item;
  const { hoveredRowId, draggingNode } = useDnDMetaState();
  const { setHoveredRowId, startDragging, reset } = useDnDActions();
  const rowId = `${nodeType}-${label}`;
  const isHovered = hoveredRowId === rowId;
  const isDragging =
    draggingNode?.nodeType === nodeType &&
    'label' in draggingNode &&
    draggingNode.label === label;

  return (
    <Command.Item
      value={label}
      onSelect={() => onSelectNode({ nodeType, ...item })}
      className={cn(
        'relative !h-auto w-full rounded-lg border border-border/60 bg-background !p-0 transition-[border-color,background-color] duration-150 ease-out data-[selected=true]:bg-background',
        {
          'cursor-grab': draggable && !isDragging,
          'cursor-grabbing': draggable && isDragging,
          'cursor-pointer': !draggable,
          'border-success/20 bg-success/[0.035] data-[selected=true]:bg-success/[0.035]':
            nodeType === AutomationNodeType.Action && isHovered,
          'border-primary/20 bg-primary/[0.035] data-[selected=true]:bg-primary/[0.035]':
            nodeType === AutomationNodeType.Trigger && isHovered,
          'border-info/20 bg-info/[0.035] data-[selected=true]:bg-info/[0.035]':
            nodeType === AutomationNodeType.Workflow && isHovered,
          'border-success/30 bg-success/5 data-[selected=true]:bg-success/5':
            nodeType === AutomationNodeType.Action && isDragging,
          'border-primary/30 bg-primary/5 data-[selected=true]:bg-primary/5':
            nodeType === AutomationNodeType.Trigger && isDragging,
        },
      )}
      draggable={draggable}
      onMouseEnter={() => setHoveredRowId(rowId)}
      onMouseLeave={() => {
        setHoveredRowId(null);
      }}
      onDragStart={
        draggable
          ? (event) => {
              startDragging({
                nodeType,
                ...item,
              } as Parameters<typeof startDragging>[0]);

              const iconElement = event.currentTarget.querySelector(
                '.node-library-row-icon',
              ) as HTMLElement | null;

              const ghost = createDragGhost({
                label,
                nodeType,
                iconMarkup: iconElement?.innerHTML || '<span>+</span>',
              });

              event.dataTransfer.setDragImage(ghost, 24, 20);
              onDragStart?.(event, { nodeType, ...item });

              window.setTimeout(() => {
                ghost.remove();
              }, 0);
            }
          : undefined
      }
      onDragEnd={
        draggable
          ? () => {
              setHoveredRowId(null);
              reset();
            }
          : undefined
      }
    >
      <div className="flex min-h-16 w-full items-center gap-3.5 px-4 py-1.5">
        <div
          className={cn(
            'node-library-row-icon flex size-10 shrink-0 items-center justify-center rounded-lg transition-[background-color,color] duration-150 ease-out [&>svg]:size-5',
            {
              'bg-success/10 text-success':
                nodeType === AutomationNodeType.Action,
              'bg-primary/10 text-primary':
                nodeType === AutomationNodeType.Trigger,
              'bg-info/10 text-info': nodeType === AutomationNodeType.Workflow,
            },
          )}
        >
          <IconComponent name={iconName} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium leading-5 text-foreground">
            {label || ''}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">
            {description || ''}
          </p>
        </div>
        {rightElement}
      </div>
    </Command.Item>
  );
};
