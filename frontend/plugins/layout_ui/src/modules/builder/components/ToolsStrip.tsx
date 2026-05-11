import { useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import { cn } from 'erxes-ui';

import { paletteByKind } from '../elements/registry';
import { ElementDef } from '../elements/types';
import {
  pageDraftAtom,
  paletteDragTypeAtom,
} from '../states/builderStates';
import { useBuilderActions } from '../hooks/useBuilderActions';

const ToolButton = ({ def }: { def: ElementDef }) => {
  const setDragType = useSetAtom(paletteDragTypeAtom);
  const draft = useAtomValue(pageDraftAtom);
  const { insertByTypeAtFrame } = useBuilderActions();
  const [dragging, setDragging] = useState(false);
  const Icon = def.icon;

  const handleClick = () => {
    if (!draft) return;
    const count = draft.root.children?.length ?? 0;
    insertByTypeAtFrame(draft.root.id, def.type, {
      x: 60 + (count % 8) * 16,
      y: 60 + (count % 8) * 16,
    });
  };

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => {
        setDragging(true);
        setDragType(def.type);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', def.type);
      }}
      onDragEnd={() => {
        setDragging(false);
        setDragType(null);
      }}
      onClick={handleClick}
      title={def.label}
      className={cn(
        'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground active:bg-muted/80',
        dragging && 'opacity-40',
      )}
    >
      <Icon size={15} />
    </button>
  );
};

const Group = ({ defs }: { defs: ElementDef[] }) => (
  <div className="flex shrink-0 items-center gap-0.5">
    {defs.map((d) => (
      <ToolButton key={d.type} def={d} />
    ))}
  </div>
);

const Divider = () => (
  <div className="mx-1 h-5 w-px shrink-0 bg-border/70" />
);

export const ToolsStrip = () => {
  const palette = paletteByKind();
  return (
    <div className="flex h-9 flex-none items-center gap-1 overflow-x-auto border-b bg-background px-3">
      <span className="mr-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Atoms
      </span>
      <Group defs={palette.atom} />
      <Divider />
      <span className="mx-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Molecules
      </span>
      <Group defs={palette.molecule} />
      <Divider />
      <span className="mx-1 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Organisms
      </span>
      <Group defs={palette.organism} />
    </div>
  );
};
