import {
  RECORD_CONTENT_TYPES,
  RecordTable,
  RecordTableInlineCell,
  RecordTablePlacementsProvider,
  Separator,
  type RecordContentType,
  type RecordTablePlacements,
} from 'erxes-ui';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { usePlacementContext } from './placementContext';
import { RecordActions } from './RecordActions';
import { getRecordTableContentType } from './recordContentTypes';
import { useExtensions } from './useExtensions';

const NO_COLUMNS: ColumnDef<{ _id: string }>[] = [];

const BulkActions: RecordTablePlacements['BulkActions'] = ({
  tableId,
  contentIds,
}) => {
  const contentType = getRecordTableContentType(tableId);

  if (!contentType) {
    return null;
  }

  return (
    <RecordActions
      contentType={contentType}
      contentIds={contentIds}
      leading={<Separator.Inline />}
    />
  );
};

/**
 * Gives every `RecordTable` the extensions' `recordColumns` and every bulk bar
 * their `recordActions`, by the record type of the table's `tableId`.
 */
export const RecordPlacementsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const extensions = useExtensions();
  const { Boundary } = usePlacementContext();

  const value = useMemo<RecordTablePlacements>(() => {
    // Built once per config change: a new column def would remount its cells.
    const byType = new Map<RecordContentType, ColumnDef<{ _id: string }>[]>();

    for (const contentType of RECORD_CONTENT_TYPES) {
      byType.set(
        contentType,
        extensions.flatMap(({ pluginName, config }) =>
          (config.recordColumns?.[contentType] ?? []).map(
            (column): ColumnDef<{ _id: string }> => ({
              id: `${pluginName}.${column.name}`,
              header: () => <RecordTable.InlineHead label={column.label} />,
              cell: ({ row }) => (
                <RecordTableInlineCell>
                  <Boundary pluginName={pluginName}>
                    <column.component
                      contentType={contentType}
                      contentId={row.original._id}
                    />
                  </Boundary>
                </RecordTableInlineCell>
              ),
              size: 160,
            }),
          ),
        ),
      );
    }

    return {
      columns: (tableId) => {
        const contentType = getRecordTableContentType(tableId);
        return (contentType && byType.get(contentType)) || NO_COLUMNS;
      },
      BulkActions,
    };
  }, [extensions, Boundary]);

  return (
    <RecordTablePlacementsProvider value={value}>
      {children}
    </RecordTablePlacementsProvider>
  );
};
