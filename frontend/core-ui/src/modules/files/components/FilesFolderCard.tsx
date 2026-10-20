import { IconFolder } from '@tabler/icons-react';
import { cn, IconComponent } from 'erxes-ui';
import { MouseEvent, ReactNode } from 'react';
import { IFilesFolder, useImageFallback } from 'ui-modules';
import { useFilesDropTarget, useFilesItemDrag } from '../hooks/useFilesItemDnd';
import { FilesSelectCheckbox } from './FilesSelectCheckbox';
import { FilesSharedWith } from './FilesSharedWith';

type TFilesFolderCardProps = {
  folder: IFilesFolder;
  selected: boolean;
  selecting: boolean;
  onClick: (e: MouseEvent) => void;
  onOpen: () => void;
  onSelect: (range: boolean) => void;
  menu: ReactNode;
};

export const FilesFolderCard = ({
  folder,
  selected,
  selecting,
  onClick,
  onOpen,
  onSelect,
  menu,
}: TFilesFolderCardProps) => {
  const color = folder.appearance?.color || undefined;
  const icon = folder.appearance?.icon;
  const cover = useImageFallback(folder.coverUrl);
  const drag = useFilesItemDrag({ itemType: 'folder', item: folder });
  const drop = useFilesDropTarget(folder);

  return (
    <div
      ref={(node) => {
        drag.setNodeRef(node);
        drop.setNodeRef(node);
      }}
      {...drag.dragProps}
      role="button"
      tabIndex={0}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-background hover:border-primary',
        selected && 'border-primary bg-primary/5 ring-1 ring-primary',
        drop.isDropTarget && 'border-primary ring-2 ring-primary',
        drag.isDragging && 'opacity-50',
      )}
      onClick={onClick}
      onKeyDown={(e) =>
        e.key === 'Enter' && e.target === e.currentTarget && onOpen()
      }
    >
      <div
        className="relative flex h-24 items-center justify-center bg-muted"
        style={color ? { backgroundColor: `${color}22` } : undefined}
      >
        {cover.showImage ? (
          <img
            src={folder.coverUrl || undefined}
            alt=""
            className="h-full w-full object-cover"
            onError={cover.onError}
          />
        ) : icon ? (
          <IconComponent name={icon} className="size-10" style={{ color }} />
        ) : (
          <IconFolder
            className="size-10 text-muted-foreground"
            style={{ color }}
          />
        )}
        <FilesSelectCheckbox
          checked={selected}
          visible={selecting}
          onToggle={onSelect}
          className="absolute left-2 top-2"
        />
        <span className="absolute bottom-1.5 right-1.5">
          <FilesSharedWith sharedWith={folder.sharedWith} />
        </span>
      </div>
      <div className="flex items-center gap-1 py-1 pl-3 pr-1">
        <span
          className="flex-1 truncate text-sm font-medium"
          title={folder.name}
        >
          {folder.name}
        </span>
        {menu}
      </div>
    </div>
  );
};
