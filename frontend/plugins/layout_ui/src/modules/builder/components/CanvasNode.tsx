import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useAtomValue } from 'jotai';
import {
  IconArrowDown,
  IconArrowUp,
  IconCopy,
  IconTrash,
} from '@tabler/icons-react';
import { cn } from 'erxes-ui';

import { BuilderNode } from '../types';
import { getDef } from '../elements/registry';
import { selectedNodeIdAtom } from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';

type Props = {
  node: BuilderNode;
  parentId: string | null;
  index: number;
};

const Gap = ({
  parentId,
  index,
}: {
  parentId: string;
  index: number;
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `gap:${parentId}:${index}`,
    data: { kind: 'gap', parentId, index },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'relative my-1 h-1 w-full rounded-full transition-all',
        isOver ? 'h-2 bg-primary' : 'bg-transparent',
      )}
    />
  );
};

const InsideZone = ({ parentId }: { parentId: string }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: `inside:${parentId}`,
    data: { kind: 'inside', parentId },
  });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[60px] items-center justify-center rounded-md border-2 border-dashed text-xs text-muted-foreground transition',
        isOver
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-muted-foreground/20',
      )}
    >
      Drop here
    </div>
  );
};

export const CanvasNode = ({ node, parentId, index }: Props) => {
  const def = getDef(node.type);
  const selectedId = useAtomValue(selectedNodeIdAtom);
  const {
    selectNode,
    removeNode,
    duplicateNode,
    moveByDelta,
  } = useBuilderActions();

  const { setNodeRef: setDragRef, listeners, attributes, isDragging } =
    useDraggable({
      id: `node:${node.id}`,
      data: { source: 'node', id: node.id },
    });

  if (!def) {
    return (
      <div className="rounded-md border border-dashed border-red-400 bg-red-50 p-3 text-sm text-red-700">
        Unknown component: <code>{node.type}</code>
        <button
          type="button"
          onClick={() => removeNode(node.id)}
          className="ml-2 underline"
        >
          remove
        </button>
      </div>
    );
  }

  const isSelected = selectedId === node.id;
  const isRoot = parentId === null;

  const accepted = def.acceptsChildren ?? false;
  const list = node.children ?? [];
  const childrenRendered = accepted ? (
    list.length === 0 ? (
      <InsideZone parentId={node.id} />
    ) : (
      <>
        {list.map((child, i) => (
          <CanvasNode
            key={child.id}
            node={child}
            parentId={node.id}
            index={i}
          />
        ))}
        <Gap parentId={node.id} index={list.length} />
      </>
    )
  ) : undefined;

  const inner = (
    <div
      onClick={(e) => {
        e.stopPropagation();
        selectNode(node.id);
      }}
      className={cn(
        'group relative rounded-md transition',
        !isRoot && 'cursor-pointer',
        !isRoot &&
          (isSelected
            ? 'outline outline-2 outline-primary'
            : 'outline-1 hover:outline hover:outline-2 hover:outline-primary/40'),
        isDragging && 'opacity-50',
      )}
    >
      {!isRoot && (
        <div
          className={cn(
            'absolute -top-7 left-0 z-10 flex items-center gap-0.5 rounded-md bg-primary px-1 py-0.5 text-xs text-primary-foreground shadow',
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
        >
          <span
            ref={setDragRef}
            {...listeners}
            {...attributes}
            className="cursor-grab px-2 font-medium"
            title="Drag to move"
          >
            {def.label}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveByDelta(node.id, -1);
            }}
            className="rounded p-1 hover:bg-white/20"
            title="Move up"
          >
            <IconArrowUp size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              moveByDelta(node.id, 1);
            }}
            className="rounded p-1 hover:bg-white/20"
            title="Move down"
          >
            <IconArrowDown size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              duplicateNode(node.id);
            }}
            className="rounded p-1 hover:bg-white/20"
            title="Duplicate"
          >
            <IconCopy size={12} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            className="rounded p-1 hover:bg-white/20"
            title="Delete"
          >
            <IconTrash size={12} />
          </button>
        </div>
      )}
      <div
        className={cn(
          !isRoot && !def.acceptsChildren && 'pointer-events-none',
        )}
      >
        <def.Component node={node}>{childrenRendered}</def.Component>
      </div>
    </div>
  );

  if (isRoot) return inner;

  return (
    <>
      {index === 0 && parentId && <Gap parentId={parentId} index={0} />}
      {inner}
      {parentId && <Gap parentId={parentId} index={index + 1} />}
    </>
  );
};
