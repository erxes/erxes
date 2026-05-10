import { useSetAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { Input, ScrollArea, cn } from 'erxes-ui';

import { ElementDef } from '../elements/types';
import { paletteByKind } from '../elements/registry';
import { paletteDragTypeAtom } from '../states/builderStates';

const PaletteItem = ({ def }: { def: ElementDef }) => {
  const setDragType = useSetAtom(paletteDragTypeAtom);
  const [dragging, setDragging] = useState(false);
  const Icon = def.icon;

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    setDragging(true);
    setDragType(def.type);
    // react-grid-layout watches for *any* native drag entering the grid.
    // dataTransfer needs at least one entry for Firefox to allow the drag.
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
      // react-grid-layout uses this className to recognise items dragged from outside.
      className={cn(
        'droppable-element flex cursor-grab select-none items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition hover:border-primary hover:bg-muted/40',
        dragging && 'opacity-40',
      )}
      title={def.description}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon size={16} />
      </span>
      <span className="flex-1 truncate font-medium">{def.label}</span>
    </div>
  );
};

const Section = ({
  title,
  defs,
}: {
  title: string;
  defs: ElementDef[];
}) => {
  if (!defs.length) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </h4>
        <span className="text-xs text-muted-foreground">{defs.length}</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {defs.map((d) => (
          <PaletteItem key={d.type} def={d} />
        ))}
      </div>
    </div>
  );
};

export const ComponentsPanel = () => {
  const [query, setQuery] = useState('');
  const palette = useMemo(() => paletteByKind(), []);

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

  return (
    <div className="flex h-full flex-col border-r bg-sidebar">
      <div className="border-b p-3">
        <h3 className="mb-2 text-sm font-semibold">Components</h3>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components"
        />
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-6 p-3">
          <Section title="Atoms" defs={filter(palette.atom)} />
          <Section title="Molecules" defs={filter(palette.molecule)} />
          <Section title="Organisms" defs={filter(palette.organism)} />
        </div>
      </ScrollArea>
    </div>
  );
};
