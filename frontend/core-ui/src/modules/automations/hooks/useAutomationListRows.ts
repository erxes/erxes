import {
  automationExpandedFoldersState,
  automationFolderChildrenState,
  TAutomationFolderChildren,
} from '@/automations/states/automationFolderRowsState';
import {
  IAutomation,
  IAutomationFolder,
  TAutomationFolderFooterListRow,
  TAutomationFolderListRow,
  TAutomationListRow,
  TAutomationRecordTableColumnDefData,
} from '@/automations/types';
import {
  ColumnDef,
  getCoreRowModel,
  Row,
  TableOptions,
} from '@tanstack/react-table';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

export const isFolderListRow = (
  row: TAutomationListRow,
): row is TAutomationFolderListRow => 'kind' in row && row.kind === 'folder';

export const isFolderFooterListRow = (
  row: TAutomationListRow,
): row is TAutomationFolderFooterListRow =>
  'kind' in row && row.kind === 'folderFooter';

export const isAutomationListRow = (
  row: TAutomationListRow,
): row is TAutomationRecordTableColumnDefData => !('kind' in row);

const toAutomationRow = (
  automation: IAutomation,
  parentFolderId?: string,
): TAutomationRecordTableColumnDefData => ({
  ...automation,
  order: parentFolderId
    ? `${parentFolderId}/${automation._id}`
    : automation._id,
  hasChildren: false,
  parentFolderId,
});

const folderRowsOf = (
  folder: IAutomationFolder,
  expanded: boolean,
  children?: TAutomationFolderChildren,
): TAutomationListRow[] => {
  const heading: TAutomationListRow = {
    _id: `folder:${folder._id}`,
    kind: 'folder',
    folder,
    expanded,
    loading: expanded && (!children || children.loading),
  };

  if (!expanded || !children || children.loading) {
    return [heading];
  }

  const rows = children.list.map((automation) =>
    toAutomationRow(automation, folder._id),
  );
  const hiddenCount = children.totalCount - children.list.length;

  // Says the folder is empty, or that it holds more than were listed
  const footer: TAutomationListRow[] =
    !rows.length || hiddenCount > 0
      ? [
          {
            _id: `folder-footer:${folder._id}`,
            kind: 'folderFooter',
            folderId: folder._id,
            hiddenCount,
          },
        ]
      : [];

  return [heading, ...rows, ...footer];
};

/**
 * The rows of the list: each folder as a heading, its automations under it
 * once opened, then what no folder holds. Folders show only while nothing
 * narrows the list; a search looks through every folder.
 */
export const useAutomationListRows = ({
  list,
  folders,
  showFolders,
}: {
  list: IAutomation[];
  folders: IAutomationFolder[];
  showFolders: boolean;
}) => {
  const expandedIds = useAtomValue(automationExpandedFoldersState);
  const children = useAtomValue(automationFolderChildrenState);
  const openFolderIds = showFolders ? expandedIds : [];

  const rows = useMemo(() => {
    const folderRows = showFolders
      ? folders.flatMap((folder) =>
          folderRowsOf(
            folder,
            expandedIds.includes(folder._id),
            children[folder._id],
          ),
        )
      : [];

    return [
      ...folderRows,
      ...list.map((automation) => toAutomationRow(automation)),
    ];
  }, [showFolders, folders, expandedIds, children, list]);

  const automationIds = useMemo(
    () => rows.filter(isAutomationListRow).map(({ _id }) => _id),
    [rows],
  );

  return { rows, automationIds, openFolderIds };
};

/**
 * Table options for the list: folder rows are headings, not records, so they
 * are never selected. The table needs its data and model restated with them.
 */
export const useAutomationListTableOptions = (
  rows: TAutomationListRow[],
  columns: ColumnDef<TAutomationRecordTableColumnDefData>[],
): TableOptions<TAutomationListRow> =>
  useMemo(
    () => ({
      data: rows,
      columns: columns as ColumnDef<TAutomationListRow>[],
      getCoreRowModel: getCoreRowModel(),
      enableRowSelection: (row: Row<TAutomationListRow>) =>
        isAutomationListRow(row.original),
    }),
    [rows, columns],
  );
