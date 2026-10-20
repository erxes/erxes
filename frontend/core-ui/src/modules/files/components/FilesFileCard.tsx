import { cn, formatBytes, Spinner } from 'erxes-ui';
import { MouseEvent, ReactNode } from 'react';
import { FileThumbnail, IFile } from 'ui-modules';
import { useFilesItemDrag } from '../hooks/useFilesItemDnd';
import { FilesPublicLinkBadge } from './FilesPublicLinkBadge';
import { FilesSelectCheckbox } from './FilesSelectCheckbox';
import { FilesSharedWith } from './FilesSharedWith';

type TFilesFileCardProps = {
  file: IFile;
  loading: boolean;
  active: boolean;
  selected: boolean;
  selecting: boolean;
  onClick: (e: MouseEvent) => void;
  onOpen: () => void;
  onSelect: (range: boolean) => void;
  menu: ReactNode;
};

export const FilesFileCard = ({
  file,
  loading,
  active,
  selected,
  selecting,
  onClick,
  onOpen,
  onSelect,
  menu,
}: TFilesFileCardProps) => {
  const drag = useFilesItemDrag({ itemType: 'file', item: file });

  return (
    <div
      ref={drag.setNodeRef}
      {...drag.dragProps}
      role="button"
      tabIndex={0}
      className={cn(
        'group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-background hover:border-primary',
        active && 'border-primary',
        selected && 'border-primary bg-primary/5 ring-1 ring-primary',
        drag.isDragging && 'opacity-50',
      )}
      onClick={onClick}
      onKeyDown={(e) =>
        e.key === 'Enter' && e.target === e.currentTarget && onOpen()
      }
    >
      <div className="relative">
        {loading ? (
          <span className="flex h-24 items-center justify-center bg-muted">
            <Spinner className="size-5" />
          </span>
        ) : (
          <FileThumbnail
            file={file}
            className="h-24 w-full rounded-none [&>svg]:size-10"
          />
        )}
        <FilesSelectCheckbox
          checked={selected}
          visible={selecting}
          onToggle={onSelect}
          className="absolute left-2 top-2"
        />
        {file.publicLink && (
          <FilesPublicLinkBadge className="absolute right-1.5 top-1.5" />
        )}
        <span className="absolute bottom-1.5 right-1.5">
          <FilesSharedWith sharedWith={file.sharedWith} />
        </span>
      </div>
      <div className="flex items-center gap-1 py-1 pl-3 pr-1">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium" title={file.name}>
            {file.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatBytes(file.size, 1)}
          </span>
        </div>
        {menu}
      </div>
    </div>
  );
};
