import {
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useState } from 'react';
import { IFilesFolder } from 'ui-modules';
import { useFilesPage } from '../context/FilesPageContext';
import { useFilesActions } from './useFilesActions';
import { TFilesItem } from './useFilesSelection';

const targetOf = (data: unknown) =>
  (data as { target?: TFilesItem } | undefined)?.target;
const folderOf = (data: unknown) =>
  (data as { folder?: IFilesFolder } | undefined)?.folder;

export const useFilesDnd = () => {
  const { selection } = useFilesPage();
  const { move } = useFilesActions();
  const [moving, setMoving] = useState<TFilesItem[]>([]);
  // A short distance keeps plain clicks working as clicks.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const onDragStart = ({ active }: DragStartEvent) => {
    const target = targetOf(active.data.current);

    if (!target) {
      return;
    }

    setMoving(selection.isSelected(target) ? selection.items : [target]);
  };

  const onDragEnd = async ({ over }: DragEndEvent) => {
    const folder = folderOf(over?.data.current);
    const items = moving;

    setMoving([]);

    const alreadyThere = items.every(({ itemType, item }) =>
      itemType === 'file'
        ? item.folderId === folder?._id
        : item.parentId === folder?._id,
    );

    if (!folder || !items.length || alreadyThere) {
      return;
    }

    const result = await move(
      {
        fileIds: items.flatMap((i) =>
          i.itemType === 'file' ? [i.item._id] : [],
        ),
        folderIds: items.flatMap((i) =>
          i.itemType === 'folder' ? [i.item._id] : [],
        ),
      },
      folder._id,
    );

    if (!result.errors) {
      selection.clear();
    }
  };

  return {
    sensors,
    onDragStart,
    onDragEnd,
    onDragCancel: () => setMoving([]),
    moving,
    movingFolderIds: moving.flatMap((i) =>
      i.itemType === 'folder' ? [i.item._id] : [],
    ),
  };
};
