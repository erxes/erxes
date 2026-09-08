import { IconArrowRight, IconCircleOff } from '@tabler/icons-react';
import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
  Table,
} from 'erxes-ui';
import { useMemo } from 'react';
import { SelectMember } from 'ui-modules';
import { useFixedAssetCategories } from '@/settings/fixed-assets/hooks/useFixedAssetCategories';
import { useFixedAssets } from '@/settings/fixed-assets/hooks/useFixedAssets';
import { useFxaOwnerRecords } from '@/settings/fixed-assets/hooks/useFxaOwnerRecords';
import {
  IFixedAsset,
  IFixedAssetCategory,
  IFxaOwnerRecord,
} from '@/settings/fixed-assets/types/FixedAsset';
import { FxaOwnerRecordActionSheet } from './FxaOwnerRecordActionSheet';

const OWNER_RECORD_STATUS_LABELS: Record<string, string> = {
  active: 'Идэвхтэй',
  inactive: 'Идэвхгүй',
};

const OWNER_RECORD_ACTION_LABELS: Record<string, string> = {
  received: 'Хүлээж авсан',
  handedOver: 'Хүлээлгэж өгсөн',
  balance: 'Үлдэгдэл',
};

type TFxaOwnerRecordRow = IFxaOwnerRecord & {
  categoryId?: string;
};

const formatDate = (date?: Date) => {
  if (!date) {
    return '';
  }

  return new Date(date).toISOString().slice(0, 10);
};

const FxaOwnerRecordMoreCell = ({
  cell,
}: {
  cell: Cell<TFxaOwnerRecordRow, unknown>;
}) => {
  const record = cell.row.original;
  const defaultValues = {
    fixedAssetId: record.fixedAssetId || '',
    code: record.code || '',
    sequence: record.sequence,
    count: record.count || 1,
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <FxaOwnerRecordActionSheet
              mode="transfer"
              defaultValues={{
                ...defaultValues,
                fromOwnerId: record.ownerId || '',
              }}
            >
              <Command.Item value="move">
                <IconArrowRight />
                Шилжүүлэх
              </Command.Item>
            </FxaOwnerRecordActionSheet>
            <FxaOwnerRecordActionSheet
              mode="handOver"
              defaultValues={{
                ...defaultValues,
                ownerId: record.ownerId || '',
              }}
            >
              <Command.Item value="out">
                <IconCircleOff />
                Цуцлах
              </Command.Item>
            </FxaOwnerRecordActionSheet>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

const FixedAssetCell = ({ fixedAsset }: { fixedAsset?: IFixedAsset }) => (
  <RecordTableInlineCell>
    {fixedAsset ? `${fixedAsset.code} - ${fixedAsset.name}` : '-'}
  </RecordTableInlineCell>
);

const CategoryCell = ({
  categoryId,
  categoriesById,
}: {
  categoryId?: string;
  categoriesById: Record<string, IFixedAssetCategory>;
}) => {
  const category = categoryId ? categoriesById[categoryId] : undefined;

  return (
    <RecordTableInlineCell>
      {category ? `${category.code} - ${category.name}` : '-'}
    </RecordTableInlineCell>
  );
};

const MemberCell = ({ userId }: { userId?: string }) => (
  <SelectMember.Provider mode="single" value={userId || ''}>
    <RecordTableInlineCell>
      <SelectMember.Value placeholder="-" />
    </RecordTableInlineCell>
  </SelectMember.Provider>
);

const getFxaOwnerRecordColumns = (
  categoriesById: Record<string, IFixedAssetCategory>,
  fixedAssetsById: Record<string, IFixedAsset>,
): ColumnDef<TFxaOwnerRecordRow>[] => [
  {
    id: 'more',
    cell: FxaOwnerRecordMoreCell,
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<TFxaOwnerRecordRow>,
  {
    id: 'code',
    accessorKey: 'code',
    header: () => <RecordTable.InlineHead label="Код" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as string}</RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'fixedAssetId',
    accessorKey: 'fixedAssetId',
    header: () => <RecordTable.InlineHead label="Үндсэн хөрөнгө" />,
    cell: ({ row }) => (
      <FixedAssetCell
        fixedAsset={
          row.original.fixedAssetId
            ? fixedAssetsById[row.original.fixedAssetId]
            : undefined
        }
      />
    ),
    size: 260,
  },
  {
    id: 'categoryId',
    accessorKey: 'categoryId',
    header: () => <RecordTable.InlineHead label="Бүлэг" />,
    cell: ({ row }) => (
      <CategoryCell
        categoryId={row.original.categoryId}
        categoriesById={categoriesById}
      />
    ),
    size: 220,
  },
  {
    id: 'count',
    accessorKey: 'count',
    header: () => <RecordTable.InlineHead label="Тоо" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>{cell.getValue() as number}</RecordTableInlineCell>
    ),
    size: 120,
  },
  {
    id: 'action',
    accessorKey: 'action',
    header: () => <RecordTable.InlineHead label="Чиглэл" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {OWNER_RECORD_ACTION_LABELS[row.original.action || ''] ||
          row.original.action ||
          '-'}
      </RecordTableInlineCell>
    ),
    size: 150,
  },
  {
    id: 'ownerId',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead label="Эд хариуцагч" />,
    cell: ({ row }) => <MemberCell userId={row.original.ownerId} />,
    size: 220,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Төлөв" />,
    cell: ({ row }) => {
      const status = row.original.status || '';

      return (
        <RecordTableInlineCell>
          {OWNER_RECORD_STATUS_LABELS[status] || status || '-'}
        </RecordTableInlineCell>
      );
    },
    size: 130,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Үүссэн огноо" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {formatDate(row.original.createdAt)}
      </RecordTableInlineCell>
    ),
    size: 140,
  },
];

const FxaOwnerRecordsSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, (_, index) => `owner-skeleton-${index}`),
    [rows],
  );

  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {Array.from({ length: 9 }, (_, index) => (
            <Table.Cell key={`${rowKey}-${index}`} className="border-r-0 px-2">
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
};

export const FxaOwnerRecordsTable = () => {
  const { fxaOwnerRecords, handleFetchMore, loading, totalCount } =
    useFxaOwnerRecords();
  const { fixedAssets } = useFixedAssets();
  const { fixedAssetCategories } = useFixedAssetCategories();
  const fixedAssetsById = useMemo(
    () =>
      (fixedAssets || []).reduce(
        (acc: Record<string, IFixedAsset>, fixedAsset) => ({
          ...acc,
          [fixedAsset._id]: fixedAsset,
        }),
        {},
      ),
    [fixedAssets],
  );
  const categoriesById = useMemo(
    () =>
      (fixedAssetCategories || []).reduce(
        (acc: Record<string, IFixedAssetCategory>, category) => ({
          ...acc,
          [category._id]: category,
        }),
        {},
      ),
    [fixedAssetCategories],
  );
  const columns = useMemo(
    () => getFxaOwnerRecordColumns(categoriesById, fixedAssetsById),
    [categoriesById, fixedAssetsById],
  );
  const records = (fxaOwnerRecords || []).map((record) => ({
    ...record,
    categoryId:
      record.categoryId ||
      (record.fixedAssetId &&
        fixedAssetsById[record.fixedAssetId]?.categoryId) ||
      '',
  }));
  const isInitialLoading = loading && !fxaOwnerRecords?.length;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : records}
      stickyColumns={['more', 'checkbox', 'code']}
      tableId="accounting_fxa_owner_records_table"
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <FxaOwnerRecordsSkeleton rows={20} />}
            {!isInitialLoading && totalCount > records.length && (
              <RecordTable.RowSkeleton
                rows={4}
                handleInView={handleFetchMore}
              />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
