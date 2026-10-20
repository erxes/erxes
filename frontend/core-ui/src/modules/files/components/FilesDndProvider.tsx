import { DndContext, DragOverlay } from '@dnd-kit/core';
import { IconFiles } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FilesDndStateProvider } from '../context/FilesDndContext';
import { useFilesDnd } from '../hooks/useFilesDnd';

export const FilesDndProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation('files');
  const dnd = useFilesDnd();

  return (
    <DndContext
      sensors={dnd.sensors}
      onDragStart={dnd.onDragStart}
      onDragEnd={dnd.onDragEnd}
      onDragCancel={dnd.onDragCancel}
    >
      <FilesDndStateProvider value={{ movingFolderIds: dnd.movingFolderIds }}>
        {children}
      </FilesDndStateProvider>
      <DragOverlay dropAnimation={null}>
        {!!dnd.moving.length && (
          <span className="inline-flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm font-medium shadow-lg">
            <IconFiles className="size-4 text-primary" />
            {dnd.moving.length === 1
              ? dnd.moving[0].item.name
              : t('items-count', { count: dnd.moving.length })}
          </span>
        )}
      </DragOverlay>
    </DndContext>
  );
};
