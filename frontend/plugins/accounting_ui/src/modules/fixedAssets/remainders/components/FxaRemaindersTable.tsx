import { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import {
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
  Table,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useBranchesMain, useDepartmentsMain } from 'ui-modules';
import { useFixedAssetCategories } from '@/settings/fixed-assets/hooks/useFixedAssetCategories';
import { useFixedAssets } from '@/settings/fixed-assets/hooks/useFixedAssets';
import {
  IFixedAsset,
  IFixedAssetCategory,
  IFixedAssetLocationRemainder,
} from '@/settings/fixed-assets/types/FixedAsset';
import { useFixedAssetRemainders } from '../hooks/useFixedAssetRemainders';

type TLabelItem = {
  code?: string;
  title?: string;
};

type TFxaRemainderRow = IFixedAssetLocationRemainder & {
  categoryId?: string;
};

const GENERAL_LABEL = 'Ерөнхий';

const formatCount = (value?: number) =>
  (value || 0).toLocaleString(undefined, { maximumFractionDigits: 4 });

const joinFixedAssetLabel = (fixedAsset?: IFixedAsset) =>
  fixedAsset ? `${fixedAsset.code} - ${fixedAsset.name}` : '-';

const joinCategoryLabel = (category?: IFixedAssetCategory) =>
  category ? `${category.code} - ${category.name}` : '-';

const joinLocationLabel = (id?: string, object?: TLabelItem) => {
  if (!id) {
    return GENERAL_LABEL;
  }

  const label = [object?.code, object?.title].filter(Boolean).join(' - ');

  return label || 'Олдоогүй';
};

const getFxaRemainderColumns = ({
  branchesById,
  categoriesById,
  departmentsById,
  fixedAssetsById,
}: {
  branchesById: Record<string, TLabelItem>;
  categoriesById: Record<string, IFixedAssetCategory>;
  departmentsById: Record<string, TLabelItem>;
  fixedAssetsById: Record<string, IFixedAsset>;
}): ColumnDef<TFxaRemainderRow>[] => [
  {
    id: 'fixedAssetId',
    accessorKey: 'fixedAssetId',
    header: () => <RecordTable.InlineHead label="Үндсэн хөрөнгө" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={joinFixedAssetLabel(
            row.original.fixedAssetId
              ? fixedAssetsById[row.original.fixedAssetId]
              : undefined,
          )}
        />
      </RecordTableInlineCell>
    ),
    size: 280,
  },
  {
    id: 'categoryId',
    accessorKey: 'categoryId',
    header: () => <RecordTable.InlineHead label="Бүлэг" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={joinCategoryLabel(
            row.original.categoryId
              ? categoriesById[row.original.categoryId]
              : undefined,
          )}
        />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'branchId',
    accessorKey: 'branchId',
    header: () => <RecordTable.InlineHead label="Салбар" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={joinLocationLabel(
            row.original.branchId,
            row.original.branchId
              ? branchesById[row.original.branchId]
              : undefined,
          )}
        />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'departmentId',
    accessorKey: 'departmentId',
    header: () => <RecordTable.InlineHead label="Хэлтэс" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip
          value={joinLocationLabel(
            row.original.departmentId,
            row.original.departmentId
              ? departmentsById[row.original.departmentId]
              : undefined,
          )}
        />
      </RecordTableInlineCell>
    ),
    size: 220,
  },
  {
    id: 'remainder',
    accessorKey: 'remainder',
    header: () => <RecordTable.InlineHead label="Үлдэгдэл" />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        {formatCount(row.original.remainder)}
      </RecordTableInlineCell>
    ),
    size: 120,
  },
];

const FxaRemaindersSkeleton = ({ rows = 20 }: { rows?: number }) => {
  const rowKeys = useMemo(
    () =>
      Array.from({ length: rows }, (_, index) => `fxa-rem-skeleton-${index}`),
    [rows],
  );

  return (
    <>
      {rowKeys.map((rowKey) => (
        <Table.Row key={rowKey} className="h-cell">
          {Array.from({ length: 5 }, (_, index) => (
            <Table.Cell key={`${rowKey}-${index}`} className="border-r-0 px-2">
              <Skeleton className="h-4 w-full min-w-4" />
            </Table.Cell>
          ))}
        </Table.Row>
      ))}
    </>
  );
};

export const FxaRemaindersTable = () => {
  const { fixedAssetRemainders, loading } = useFixedAssetRemainders();
  const fixedAssetIds = [
    ...new Set(
      fixedAssetRemainders
        .map((item) => item.fixedAssetId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const branchIds = [
    ...new Set(
      fixedAssetRemainders
        .map((item) => item.branchId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const departmentIds = [
    ...new Set(
      fixedAssetRemainders
        .map((item) => item.departmentId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];
  const { fixedAssets, loading: loadingFixedAssets } = useFixedAssets({
    variables: { ids: fixedAssetIds },
    skip: fixedAssetIds.length === 0,
  });
  const { fixedAssetCategories, loading: loadingCategories } =
    useFixedAssetCategories();
  const { branches, loading: loadingBranches } = useBranchesMain({
    variables: { ids: branchIds, withoutUserFilter: true },
    skip: branchIds.length === 0,
  });
  const { departments, loading: loadingDepartments } = useDepartmentsMain({
    variables: { ids: departmentIds, withoutUserFilter: true },
    skip: departmentIds.length === 0,
  });
  const fixedAssetsById = useMemo(
    () =>
      (fixedAssets || []).reduce<Record<string, IFixedAsset>>(
        (result, fixedAsset) => ({
          ...result,
          [fixedAsset._id]: fixedAsset,
        }),
        {},
      ),
    [fixedAssets],
  );
  const categoriesById = useMemo(
    () =>
      (fixedAssetCategories || []).reduce<Record<string, IFixedAssetCategory>>(
        (result, category) => ({
          ...result,
          [category._id]: category,
        }),
        {},
      ),
    [fixedAssetCategories],
  );
  const branchesById = useMemo(
    () =>
      (branches || []).reduce<Record<string, TLabelItem>>(
        (result, branch) => ({
          ...result,
          [branch._id]: branch,
        }),
        {},
      ),
    [branches],
  );
  const departmentsById = useMemo(
    () =>
      (departments || []).reduce<Record<string, TLabelItem>>(
        (result, department) => ({
          ...result,
          [department._id]: department,
        }),
        {},
      ),
    [departments],
  );
  const rows = useMemo<TFxaRemainderRow[]>(
    () =>
      fixedAssetRemainders.map((item) => ({
        ...item,
        categoryId: item.fixedAssetId
          ? fixedAssetsById[item.fixedAssetId]?.categoryId
          : undefined,
      })),
    [fixedAssetRemainders, fixedAssetsById],
  );
  const columns = useMemo(
    () =>
      getFxaRemainderColumns({
        branchesById,
        categoriesById,
        departmentsById,
        fixedAssetsById,
      }),
    [branchesById, categoriesById, departmentsById, fixedAssetsById],
  );
  const isInitialLoading =
    loading ||
    loadingFixedAssets ||
    loadingCategories ||
    loadingBranches ||
    loadingDepartments;

  return (
    <RecordTable.Provider
      columns={columns}
      data={isInitialLoading ? [] : rows}
      stickyColumns={['fixedAssetId']}
      tableId="accounting_fxa_remainders_table"
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header showColumnSelector />
          <RecordTable.Body>
            <RecordTable.RowList />
            {isInitialLoading && <FxaRemaindersSkeleton rows={20} />}
            {!isInitialLoading && rows.length === 0 && (
              <Table.Row>
                <Table.Cell
                  colSpan={columns.length}
                  className="text-center text-muted-foreground"
                >
                  Үлдэгдэл олдсонгүй.
                </Table.Cell>
              </Table.Row>
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
};
