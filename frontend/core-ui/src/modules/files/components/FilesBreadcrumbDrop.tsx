import { cn } from 'erxes-ui';
import { ReactNode } from 'react';
import { IFilesFolder } from 'ui-modules';
import { useFilesDropTarget } from '../hooks/useFilesItemDnd';

export const FilesBreadcrumbDrop = ({
  folder,
  children,
}: {
  folder: IFilesFolder;
  children: ReactNode;
}) => {
  const drop = useFilesDropTarget(folder);

  return (
    <span
      ref={drop.setNodeRef}
      className={cn('rounded-md', drop.isDropTarget && 'ring-2 ring-primary')}
    >
      {children}
    </span>
  );
};
