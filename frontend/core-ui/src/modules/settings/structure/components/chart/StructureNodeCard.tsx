import { Handle, Node, NodeProps, Position } from '@xyflow/react';
import {
  IconChevronDown,
  IconDots,
  IconPencil,
  IconPlus,
  IconUsers,
} from '@tabler/icons-react';
import { Avatar, cn, readImage, Spinner } from 'erxes-ui';
import {
  IStructureChartItem,
  IStructureChartUnit,
  StructureChartView,
} from '../../types/chart';

export type StructureFlowNode = Node<StructureNodeData, 'structure'>;

export interface StructureNodeData extends Record<string, unknown> {
  item: IStructureChartItem;
  view: StructureChartView;
  childrenCount: number;
  collapsed: boolean;
  dimmed: boolean;
  dropTarget: boolean;
  pending: boolean;
  canManage: boolean;
  units: IStructureChartUnit[];
  onToggleCollapse: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onOpenUnit: (id: string) => void;
  onAddChild: (id: string) => void;
  onAddUnit: (departmentId: string) => void;
  onRequestMenu: (id: string, anchor: HTMLElement) => void;
  onOpenMembers?: (id: string) => void;
}

const iconButtonClass =
  'nodrag nopan grid size-6 place-items-center rounded-md border bg-background text-muted-foreground shadow-xs hover:bg-accent hover:text-foreground';

export const StructureNodeCard = ({ data }: NodeProps<StructureFlowNode>) => {
  const {
    item,
    view,
    childrenCount,
    collapsed,
    dimmed,
    dropTarget,
    pending,
    canManage,
    units,
    onToggleCollapse,
    onOpenDetail,
    onOpenUnit,
    onAddChild,
    onAddUnit,
    onRequestMenu,
    onOpenMembers,
  } = data;

  const supervisorName = item.supervisor?.details?.fullName || '';
  const supervisorAvatar = item.supervisor?.details?.avatar;

  const addUnitPill = canManage && view === 'departments' && (
    <button
      type="button"
      className="nodrag nopan rounded-full border border-dashed px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
      onClick={(event) => {
        event.stopPropagation();
        onAddUnit(item._id);
      }}
    >
      + unit
    </button>
  );

  return (
    <div
      className={cn(
        'group relative w-[264px] rounded-xl border bg-card p-3 text-left shadow-sm transition-colors',
        dimmed && 'opacity-30',
        dropTarget && 'ring-2 ring-primary border-primary',
        pending && 'opacity-60',
      )}
    >
      {(
        [
          ['top', Position.Top],
          ['right', Position.Right],
          ['bottom', Position.Bottom],
          ['left', Position.Left],
        ] as const
      ).flatMap(([side, position]) => [
        <Handle
          key={`${side}-source`}
          id={side}
          type="source"
          position={position}
          isConnectable={false}
          className="!opacity-0 !pointer-events-none"
        />,
        <Handle
          key={`${side}-target`}
          id={side}
          type="target"
          position={position}
          isConnectable={false}
          className="!opacity-0 !pointer-events-none"
        />,
      ])}

      {pending && (
        <div className="absolute inset-0 z-10 grid place-items-center rounded-xl bg-background/50">
          <Spinner size="sm" />
        </div>
      )}

      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-5">
            {item.title || 'Untitled'}
          </p>
          {item.code && (
            <p className="truncate font-mono text-xs text-muted-foreground">
              {item.code}
            </p>
          )}
        </div>
        {childrenCount > 0 && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleCollapse(item._id);
            }}
            className={cn(
              iconButtonClass,
              'border-none shadow-none bg-transparent',
            )}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            <IconChevronDown
              className={cn(
                'size-4 transition-transform',
                collapsed && '-rotate-90',
              )}
            />
          </button>
        )}
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        {onOpenMembers ? (
          <button
            type="button"
            className="nodrag nopan inline-flex items-center gap-1 hover:text-foreground"
            onClick={(event) => {
              event.stopPropagation();
              onOpenMembers(item._id);
            }}
          >
            <IconUsers className="size-3.5" />
            {item.userCount ?? 0}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1">
            <IconUsers className="size-3.5" />
            {item.userCount ?? 0}
          </span>
        )}
        {childrenCount > 0 && (
          <span>{childrenCount} child{childrenCount === 1 ? '' : 'ren'}</span>
        )}
        {item.supervisor && (
          <span className="ml-auto inline-flex items-center gap-1.5 min-w-0">
            <Avatar size="xs">
              <Avatar.Image src={readImage(supervisorAvatar || '')} />
              <Avatar.Fallback>
                {supervisorName.charAt(0).toUpperCase()}
              </Avatar.Fallback>
            </Avatar>
            <span className="max-w-24 truncate">{supervisorName}</span>
          </span>
        )}
      </div>

      {view === 'departments' && units.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1 border-t pt-2">
          {units.map((unit) => (
            <button
              key={unit._id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenUnit(unit._id);
              }}
              className="nodrag nopan rounded-full border px-2 py-0.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {unit.title} · {unit.userCount ?? 0}
            </button>
          ))}
          {addUnitPill}
        </div>
      )}

      {view === 'departments' && units.length === 0 && canManage && (
        <div className="mt-2 hidden border-t pt-2 group-hover:block">
          {addUnitPill}
        </div>
      )}

      {canManage && (
        <div className="absolute -top-3 right-2 hidden items-center gap-1 group-hover:flex">
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Add child"
            onClick={(event) => {
              event.stopPropagation();
              onAddChild(item._id);
            }}
          >
            <IconPlus className="size-3.5" />
          </button>
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Edit"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetail(item._id);
            }}
          >
            <IconPencil className="size-3.5" />
          </button>
          <button
            type="button"
            className={iconButtonClass}
            aria-label="More actions"
            onClick={(event) => {
              event.stopPropagation();
              onRequestMenu(item._id, event.currentTarget);
            }}
          >
            <IconDots className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
