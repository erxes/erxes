import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAtom } from 'jotai';
import { IconGripVertical } from '@tabler/icons-react';
import { BLOCK_REGISTRY } from '../../blocks/registry';
import { BlockInstance } from '../../blocks/types';
import { useBuilderContext } from '../BuilderContext';
import { selectedBlockIdAtom } from '../state/builderState';

interface BlockRendererProps {
  block: BlockInstance;
}

export const BlockRenderer = ({ block }: BlockRendererProps) => {
  const def = BLOCK_REGISTRY[block.key];
  const [selectedId, setSelectedId] = useAtom(selectedBlockIdAtom);
  const { clientPortalId } = useBuilderContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block._id, data: { kind: 'block' } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  if (!def) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded border border-dashed p-3 text-sm text-destructive"
      >
        Unknown block: {block.key}
      </div>
    );
  }

  const isSelected = selectedId === block._id;

  // For organisms backed by CMS, surface the selected entity id as a prop so
  // the Render function can read either props.categoryId / menuKind / etc. or
  // the generic contentTypeId. Map generically here.
  const propsForRender = block.contentTypeId
    ? { ...block.props, categoryId: block.contentTypeId, menuKind: block.contentTypeId }
    : block.props;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedId(block._id);
      }}
      className={`group relative rounded-md transition-shadow ${
        isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
          : 'hover:ring-1 hover:ring-primary/30'
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute -left-7 top-2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border rounded p-1 text-muted-foreground cursor-grab active:cursor-grabbing"
        title="Drag to reorder"
        onClick={(e) => e.stopPropagation()}
      >
        <IconGripVertical size={14} />
      </button>
      <def.Render
        props={propsForRender}
        clientPortalId={clientPortalId}
      />
    </div>
  );
};
