import { useDraggable } from '@dnd-kit/core';
import { ScrollArea } from 'erxes-ui';
import { useMemo } from 'react';
import { getAllBlocks } from '../../blocks/registry';
import { BlockDefinition, BlockLevel } from '../../blocks/types';

const PaletteItem = ({ def }: { def: BlockDefinition }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${def.key}`,
    data: { kind: 'palette', key: def.key },
  });

  const Icon = def.icon;

  return (
    <button
      type="button"
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md border bg-card hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing transition-colors text-left ${
        isDragging ? 'opacity-40' : ''
      }`}
      title={def.description || def.label}
    >
      <Icon size={16} className="text-muted-foreground shrink-0" />
      <span className="truncate">{def.label}</span>
    </button>
  );
};

const SECTION_TITLE: Record<BlockLevel, string> = {
  atom: 'Atoms',
  molecule: 'Molecules',
  organism: 'Organisms',
};

const SECTION_HINT: Record<BlockLevel, string> = {
  atom: 'Primitive elements',
  molecule: 'Reusable compositions',
  organism: 'Page sections (CMS-aware)',
};

export const BuilderSidebar = () => {
  const grouped = useMemo(() => {
    const all = getAllBlocks();
    return {
      organism: all.filter((b) => b.level === 'organism'),
      molecule: all.filter((b) => b.level === 'molecule'),
      atom: all.filter((b) => b.level === 'atom'),
    };
  }, []);

  return (
    <aside className="w-64 border-r bg-card flex flex-col">
      <div className="px-4 py-3 border-b">
        <div className="text-sm font-semibold">Blocks</div>
        <div className="text-xs text-muted-foreground">Drag onto the canvas</div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-5">
          {(['organism', 'molecule', 'atom'] as BlockLevel[]).map((level) => (
            <div key={level} className="space-y-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {SECTION_TITLE[level]}
                </div>
                <div className="text-[11px] text-muted-foreground/80">
                  {SECTION_HINT[level]}
                </div>
              </div>
              <div className="space-y-1.5">
                {grouped[level].map((def) => (
                  <PaletteItem key={def.key} def={def} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
};
