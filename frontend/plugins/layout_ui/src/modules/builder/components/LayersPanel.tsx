import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import {
  IconArrowDownToArc,
  IconArrowUpFromArc,
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconEyeOff,
  IconLock,
  IconLockOpen,
  IconStack2,
  IconTrash,
} from '@tabler/icons-react';
import { ScrollArea, cn } from 'erxes-ui';

import {
  pageDraftAtom,
  selectedNodeIdsAtom,
} from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';
import { getDef } from '../elements/registry';

const labelFor = (
  node: { type: string; name?: string; props: Record<string, unknown> },
) => {
  if (node.name?.trim()) return node.name;
  const def = getDef(node.type);
  const text = (node.props?.text || node.props?.heading || node.props?.label) as
    | string
    | undefined;
  if (text) return text.length > 24 ? `${text.slice(0, 22)}…` : text;
  return def?.label ?? node.type;
};

export const LayersPanel = () => {
  const draft = useAtomValue(pageDraftAtom);
  const selectedIds = useAtomValue(selectedNodeIdsAtom);
  const setSelectedIds = useSetAtom(selectedNodeIdsAtom);
  const {
    reorderZ,
    reorderToIndex,
    setNodeFlag,
    removeMany,
    renameNode,
  } = useBuilderActions();

  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [dragId, setDragId] = useState<string | null>(null);

  if (!draft) return null;

  const children = draft.root.children ?? [];
  // Figma convention: front-most layer at top of list.
  const ordered = [...children].sort(
    (a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0),
  );
  const lastIndex = ordered.length - 1;

  const select = (id: string, additive: boolean) => {
    if (additive) {
      setSelectedIds(
        selectedIds.includes(id)
          ? selectedIds.filter((x) => x !== id)
          : [...selectedIds, id],
      );
    } else {
      setSelectedIds([id]);
    }
  };

  const startRename = (id: string, current: string) => {
    setRenaming(id);
    setRenameValue(current);
  };

  const commitRename = () => {
    if (renaming) renameNode(renaming, renameValue.trim());
    setRenaming(null);
  };

  return (
    <div className="flex h-full flex-col border-l bg-sidebar">
      <div className="flex items-center justify-between border-b p-3">
        <div className="flex items-center gap-1.5">
          <IconStack2 size={14} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold">Layers</h3>
        </div>
        <span className="text-xs text-muted-foreground">{ordered.length}</span>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-1 border-b bg-background/40 p-2">
          <button
            type="button"
            title="Bring to front"
            onClick={() => selectedIds.forEach((id) => reorderZ(id, 'front'))}
            className="rounded p-1 hover:bg-muted"
          >
            <IconArrowUpFromArc size={14} />
          </button>
          <button
            type="button"
            title="Send to back"
            onClick={() => selectedIds.forEach((id) => reorderZ(id, 'back'))}
            className="rounded p-1 hover:bg-muted"
          >
            <IconArrowDownToArc size={14} />
          </button>
          <button
            type="button"
            title="Bring forward"
            onClick={() =>
              selectedIds.forEach((id) => reorderZ(id, 'forward'))
            }
            className="rounded p-1 hover:bg-muted"
          >
            <IconChevronUp size={14} />
          </button>
          <button
            type="button"
            title="Send backward"
            onClick={() =>
              selectedIds.forEach((id) => reorderZ(id, 'backward'))
            }
            className="rounded p-1 hover:bg-muted"
          >
            <IconChevronDown size={14} />
          </button>
          <div className="ml-auto" />
          <button
            type="button"
            title="Delete selection"
            onClick={() => removeMany(selectedIds)}
            className="rounded p-1 text-red-500 hover:bg-red-500/10"
          >
            <IconTrash size={14} />
          </button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          {ordered.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              No components yet. Drop one onto the canvas.
            </div>
          )}
          {ordered.map((c, idx) => {
            const isSelected = selectedIds.includes(c.id);
            const def = getDef(c.type);
            const Icon = def?.icon;
            const stackIndex = lastIndex - idx; // 0 = back

            return (
              <div
                key={c.id}
                draggable={!c.locked}
                onDragStart={(e) => {
                  setDragId(c.id);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  if (dragId && dragId !== c.id) e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!dragId || dragId === c.id) return;
                  reorderToIndex(dragId, stackIndex);
                  setDragId(null);
                }}
                onDragEnd={() => setDragId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  select(c.id, e.shiftKey || e.metaKey || e.ctrlKey);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  startRename(c.id, labelFor(c));
                }}
                className={cn(
                  'group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition',
                  isSelected
                    ? 'bg-primary/15 text-foreground'
                    : 'hover:bg-muted/60',
                  c.hidden && 'opacity-50',
                )}
                title={`${def?.label ?? c.type} · z=${c.zIndex ?? 0}`}
              >
                {Icon ? (
                  <Icon size={14} className="text-muted-foreground" />
                ) : (
                  <span className="h-3.5 w-3.5" />
                )}
                {renaming === c.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename();
                      if (e.key === 'Escape') setRenaming(null);
                    }}
                    className="flex-1 rounded border bg-background px-1 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 truncate">{labelFor(c)}</span>
                )}

                <button
                  type="button"
                  title={c.locked ? 'Unlock' : 'Lock'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNodeFlag(c.id, 'locked', !c.locked);
                  }}
                  className={cn(
                    'rounded p-0.5 transition',
                    c.locked
                      ? 'text-foreground'
                      : 'text-muted-foreground opacity-0 group-hover:opacity-100',
                  )}
                >
                  {c.locked ? <IconLock size={12} /> : <IconLockOpen size={12} />}
                </button>
                <button
                  type="button"
                  title={c.hidden ? 'Show' : 'Hide'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setNodeFlag(c.id, 'hidden', !c.hidden);
                  }}
                  className={cn(
                    'rounded p-0.5 transition',
                    c.hidden
                      ? 'text-foreground'
                      : 'text-muted-foreground opacity-0 group-hover:opacity-100',
                  )}
                >
                  {c.hidden ? <IconEyeOff size={12} /> : <IconEye size={12} />}
                </button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};
