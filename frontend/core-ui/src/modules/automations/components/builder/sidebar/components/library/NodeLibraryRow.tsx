import { useDnD } from '@/automations/context/AutomationBuilderDnDProvider';
import { AutomationNodeType } from '@/automations/types';
import { cn, Command, IconComponent } from 'erxes-ui';
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
        border:1px solid ${
          nodeType === AutomationNodeType.Trigger
            ? 'rgba(99,102,241,0.18)'
            : 'rgba(34,197,94,0.18)'
        };
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
          background:${
            nodeType === AutomationNodeType.Trigger
              ? 'rgba(99,102,241,0.10)'
              : 'rgba(34,197,94,0.10)'
          };
          color:${
            nodeType === AutomationNodeType.Trigger
              ? 'rgb(99,102,241)'
              : 'rgb(34,197,94)'
          };
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
  nodeType,
}: NodeLibraryRowProps) => {
  const { icon: iconName, label, description } = item;
  const {
    state: { hoveredRowId, draggingNode },
    setHoveredRowId,
    startDragging,
    reset,
  } = useDnD();
  const rowId = `${nodeType}-${label}`;
  const isHovered = hoveredRowId === rowId;
  const isDragging =
    draggingNode?.nodeType === nodeType &&
    'label' in draggingNode &&
    draggingNode.label === label;

  return (
    <Command.Item value={label} asChild>
      <div
        className={cn(
          'relative h-fit w-full rounded-xl border border-border/70 bg-background px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-20px_rgba(15,23,42,0.22)] transition-[transform,box-shadow,border-color,background-color] duration-200 ease-out will-change-transform',
          {
            'cursor-grab': !isDragging,
            'cursor-grabbing': isDragging,
            'border-success/30 bg-success/[0.035] shadow-[0_16px_32px_-22px_rgba(34,197,94,0.34),0_6px_14px_-10px_rgba(15,23,42,0.12)]':
              nodeType === AutomationNodeType.Action && isHovered,
            'border-primary/30 bg-primary/[0.035] shadow-[0_16px_32px_-22px_rgba(99,102,241,0.34),0_6px_14px_-10px_rgba(15,23,42,0.12)]':
              nodeType === AutomationNodeType.Trigger && isHovered,
            'border-success/35 bg-success/[0.05] shadow-[0_22px_44px_-26px_rgba(34,197,94,0.36),0_10px_18px_-12px_rgba(15,23,42,0.14)]':
              nodeType === AutomationNodeType.Action && isDragging,
            'border-primary/35 bg-primary/[0.05] shadow-[0_22px_44px_-26px_rgba(99,102,241,0.36),0_10px_18px_-12px_rgba(15,23,42,0.14)]':
              nodeType === AutomationNodeType.Trigger && isDragging,
          },
        )}
        draggable
        onMouseEnter={() => setHoveredRowId(rowId)}
        onMouseLeave={() => {
          setHoveredRowId(null);
        }}
        onDragStart={(event) => {
          startDragging({
            nodeType: nodeType as
              | AutomationNodeType.Action
              | AutomationNodeType.Trigger,
            ...item,
          });

          const iconElement = event.currentTarget.querySelector(
            '.node-library-row-icon',
          ) as HTMLElement | null;

          const ghost = createDragGhost({
            label,
            nodeType,
            iconMarkup: iconElement?.innerHTML || '<span>+</span>',
          });

          event.dataTransfer.setDragImage(ghost, 24, 20);
          onDragStart(event, { nodeType, ...item });

          window.setTimeout(() => {
            ghost.remove();
          }, 0);
        }}
        onDragEnd={() => {
          setHoveredRowId(null);
          reset();
        }}
        style={{
          transform: `translate3d(0, ${
            isDragging ? -4 : isHovered ? -3 : 0
          }px, 0)`,
        }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              'node-library-row-icon flex size-10 shrink-0 items-center justify-center rounded-xl border border-transparent transition-[transform,background-color,color,box-shadow] duration-200 ease-out',
              {
                'bg-success/10 text-success':
                  nodeType === AutomationNodeType.Action,
                'bg-primary/10 text-primary':
                  nodeType === AutomationNodeType.Trigger,
                'translate-y-[-1px] shadow-[0_10px_18px_-14px_rgba(34,197,94,0.45)]':
                  nodeType === AutomationNodeType.Action && isHovered,
                'translate-y-[-1px] shadow-[0_10px_18px_-14px_rgba(99,102,241,0.45)]':
                  nodeType === AutomationNodeType.Trigger && isHovered,
                'translate-y-[-2px] shadow-[0_14px_24px_-16px_rgba(34,197,94,0.5)]':
                  nodeType === AutomationNodeType.Action && isDragging,
                'translate-y-[-2px] shadow-[0_14px_24px_-16px_rgba(99,102,241,0.5)]':
                  nodeType === AutomationNodeType.Trigger && isDragging,
              },
            )}
          >
            <IconComponent name={iconName} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold leading-5 text-foreground">
              {label || ''}
            </div>
            <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted-foreground">
              {description || ''}
            </p>
          </div>
        </div>
      </div>
    </Command.Item>
  );
};
