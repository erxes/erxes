import { useDraggable, useDroppable } from '@dnd-kit/core';
import { filesCanContribute, filesCanManage, IFilesFolder } from 'ui-modules';
import { useFilesDndState } from '../context/FilesDndContext';
import { filesItemKey, TFilesItem } from './useFilesSelection';

export const FILES_DROP_PREFIX = 'drop:';

export const useFilesDropTarget = (folder?: IFilesFolder) => {
  const { movingFolderIds } = useFilesDndState();
  const blocked =
    !folder ||
    !filesCanContribute(folder.myRole) ||
    movingFolderIds.includes(folder._id) ||
    !!folder.ancestorIds?.some((id) => movingFolderIds.includes(id));
  const { setNodeRef, isOver, active } = useDroppable({
    id: `${FILES_DROP_PREFIX}${folder?._id || 'none'}`,
    data: { folder },
    disabled: blocked,
  });

  return { setNodeRef, isDropTarget: !!active && isOver && !blocked };
};

export const useFilesItemDrag = (target: TFilesItem) => {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: filesItemKey(target),
    data: { target },
    disabled: !filesCanManage(target.item.myRole),
  });

  return { setNodeRef, dragProps: { ...attributes, ...listeners }, isDragging };
};
