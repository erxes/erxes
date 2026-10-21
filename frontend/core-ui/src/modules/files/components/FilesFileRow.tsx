import { Checkbox, cn, formatBytes, Spinner, Table } from 'erxes-ui';
import { MouseEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FileThumbnail, IFile } from 'ui-modules';
import { useFilesItemDrag } from '../hooks/useFilesItemDnd';
import { FilesPublicLinkBadge } from './FilesPublicLinkBadge';
import { FilesSharedWith } from './FilesSharedWith';

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : '';

type TFilesFileRowProps = {
  file: IFile;
  loading: boolean;
  active: boolean;
  selected: boolean;
  onClick: (e: MouseEvent) => void;
  onSelect: (range: boolean) => void;
  menu: ReactNode;
};

export const FilesFileRow = ({
  file,
  loading,
  active,
  selected,
  onClick,
  onSelect,
  menu,
}: TFilesFileRowProps) => {
  const { t } = useTranslation('files');
  const drag = useFilesItemDrag({ itemType: 'file', item: file });

  return (
    <Table.Row
      ref={drag.setNodeRef}
      {...drag.dragProps}
      // dnd-kit marks drag handles as buttons; a table row stays a row.
      role="row"
      className={cn(
        'group cursor-pointer',
        active && 'bg-muted',
        selected && 'bg-primary/5',
        drag.isDragging && 'opacity-50',
      )}
      onClick={onClick}
    >
      <Table.Cell className="w-10">
        <Checkbox
          checked={selected}
          aria-label={t('select')}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSelect(e.shiftKey);
          }}
        />
      </Table.Cell>
      <Table.Cell>
        <span className="flex items-center gap-2">
          {loading ? (
            <span className="flex size-8 shrink-0 items-center justify-center">
              <Spinner className="size-4" />
            </span>
          ) : (
            <FileThumbnail file={file} />
          )}
          <span className="truncate">{file.name}</span>
          {file.publicLink && <FilesPublicLinkBadge />}
        </span>
      </Table.Cell>
      <Table.Cell>
        <FilesSharedWith sharedWith={file.sharedWith} />
      </Table.Cell>
      <Table.Cell className="text-muted-foreground">
        {formatBytes(file.size, 1)}
      </Table.Cell>
      <Table.Cell className="text-muted-foreground">
        {formatDate(file.updatedAt)}
      </Table.Cell>
      <Table.Cell>{menu}</Table.Cell>
    </Table.Row>
  );
};
