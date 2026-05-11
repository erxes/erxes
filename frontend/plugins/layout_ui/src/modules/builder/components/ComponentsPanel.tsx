import { useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { Input, ScrollArea, cn } from 'erxes-ui';

import { ElementDef } from '../elements/types';
import { paletteByKind } from '../elements/registry';
import {
  pageDraftAtom,
  paletteDragTypeAtom,
} from '../states/builderStates';
import { useAtomValue } from 'jotai';
import { useBuilderActions } from '../hooks/useBuilderActions';

const PaletteItem = ({
  def,
  onPick,
}: {
  def: ElementDef;
  onPick?: (type: string) => void;
}) => {
  const setDragType = useSetAtom(paletteDragTypeAtom);
  const [dragging, setDragging] = useState(false);
  const Icon = def.icon;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(true);
    setDragType(def.type);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', def.type);
  };

  const handleDragEnd = () => {
    setDragging(false);
    setDragType(null);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onPick?.(def.type)}
      className={cn(
        'flex cursor-pointer select-none items-center gap-2 rounded-md border border-transparent bg-background/60 px-2.5 py-1.5 text-sm shadow-sm transition hover:border-primary/40 hover:bg-muted/40',
        dragging && 'opacity-40',
      )}
      title={def.description}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon size={14} />
      </span>
      <span className="flex-1 truncate text-xs font-medium">{def.label}</span>
    </div>
  );
};

const Section = ({
  title,
  defs,
  onPick,
}: {
  title: string;
  defs: ElementDef[];
  onPick?: (type: string) => void;
}) => {
  if (!defs.length) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <span className="text-[10px] text-muted-foreground/70">
          {defs.length}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-1">
        {defs.map((d) => (
          <PaletteItem key={d.type} def={d} onPick={onPick} />
        ))}
      </div>
    </div>
  );
};

/**
 * Component picker UI. Embed inside a popover, drawer, or panel.
 * Items are draggable to the canvas; clicking inserts at a sensible default
 * position via `onPick`.
 */
export const ComponentsPicker = ({
  onPicked,
}: {
  /** Fires after a click-to-insert so the host can close the popover. */
  onPicked?: () => void;
}) => {
  const [query, setQuery] = useState('');
  const palette = useMemo(() => paletteByKind(), []);
  const draft = useAtomValue(pageDraftAtom);
  const { insertByTypeAtFrame } = useBuilderActions();

  const filter = (defs: ElementDef[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return defs;
    return defs.filter(
      (d) =>
        d.label.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q),
    );
  };

  const handlePick = (type: string) => {
    if (!draft) return;
    const count = draft.root.children?.length ?? 0;
    // stagger so consecutive inserts don't perfectly overlap
    insertByTypeAtFrame(draft.root.id, type, {
      x: 60 + (count % 8) * 16,
      y: 60 + (count % 8) * 16,
    });
    onPicked?.();
  };

  return (
    <div className="flex h-full max-h-[480px] w-[280px] flex-col">
      <div className="p-2">
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components"
          className="h-8 text-sm"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-3 px-2 pb-2">
          <Section
            title="Atoms"
            defs={filter(palette.atom)}
            onPick={handlePick}
          />
          <Section
            title="Molecules"
            defs={filter(palette.molecule)}
            onPick={handlePick}
          />
          <Section
            title="Organisms"
            defs={filter(palette.organism)}
            onPick={handlePick}
          />
        </div>
      </ScrollArea>
    </div>
  );
};
