import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useStructureDndState } from '../contexts/StructureDndStateContext';
import { useStructureWorkspace } from '../contexts/StructureWorkspaceContext';
import { TStructureTreeEntity } from '../types/structureEntity';
import { resolveStructureDrop } from '../utils/structureDrop';
import { isStructureEntityArchived } from '../utils/structureEntityStatus';
import { toStructureDropId } from './useStructureDnd';

export const useStructureCardDnd = (entity: TStructureTreeEntity) => {
  const { canManage } = useStructureWorkspace();
  const { activeItem, copy } = useStructureDndState();
  const dragDisabled =
    !canManage || !entity.parentId || isStructureEntityArchived(entity);
  const drag = useDraggable({
    id: `entity:${entity._id}`,
    data: { item: { kind: 'entity', entity } },
    disabled: dragDisabled,
  });
  const canDrop =
    canManage &&
    !!activeItem &&
    resolveStructureDrop({
      item: activeItem,
      target: entity,
      copy,
    }).kind !== 'invalid';
  const drop = useDroppable({
    id: toStructureDropId(entity._id),
    disabled: !canDrop,
  });

  return {
    setNodeRef: (node: HTMLElement | null) => {
      drag.setNodeRef(node);
      drop.setNodeRef(node);
    },
    dragProps: dragDisabled ? {} : { ...drag.attributes, ...drag.listeners },
    isDragging: drag.isDragging,
    isDropTarget: drop.isOver && canDrop,
  };
};
