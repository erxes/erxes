import { ColumnDef } from '@tanstack/react-table';
import {
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
  Switch,
} from 'erxes-ui';
import { useLoyaltyScore } from '../hooks/useLoyaltyScore';
import {
  IconCheck,
  IconImageInPicture,
  IconLabelFilled,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { loyaltyScoreMoreColumn } from './LoyaltyScoreMoreColumn';
import { LoyaltyScoreCommandBar } from './loyalty-score-command-bar/LoyaltyScoreCommandBar';
import { LOYALTY_SCORE_PER_PAGE } from '../hooks/useLoyaltyScore';
import { useLoyaltyScoreEdit } from '../hooks/useLoyaltyScoreEdit';

export const LoyaltyScoreRecordTable = () => {
  const { campaigns, loading } = useLoyaltyScore();
  const { editStatus } = useLoyaltyScoreEdit();

  const categories = campaigns?.map((category: any) => ({
    ...category,
    hasChildren: campaigns?.some((c: any) => c.parentId === category._id),
  }));

  const categoryObject = useMemo(() => {
    return categories?.reduce((acc: Record<string, any>, category: any) => {
      acc[category._id] = category;
      return acc;
    }, {});
  }, [categories]);

  return (
    <RecordTable.Provider
      columns={loyaltyScoreColumns(categoryObject || {}, editStatus)}
      data={categories || []}
      className="m-3"
    >
      <RecordTableTree id="product-categories" ordered>
        <RecordTable.Scroll>
          <RecordTable>
            <RecordTable.Header />
            <RecordTable.Body>
              <RecordTable.RowList Row={RecordTableTree.Row} />
              {loading && (
                <RecordTable.RowSkeleton rows={LOYALTY_SCORE_PER_PAGE} />
              )}
            </RecordTable.Body>
          </RecordTable>
        </RecordTable.Scroll>
      </RecordTableTree>
      <LoyaltyScoreCommandBar />
    </RecordTable.Provider>
  );
};

export const loyaltyScoreColumns: (
  categoryObject: Record<string, any>,
  editStatus: (options: any) => void,
) => ColumnDef<any & { hasChildren: boolean }>[] = (
  categoryObject,
  editStatus,
) => [
  loyaltyScoreMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<any & { hasChildren: boolean }>,
  {
    id: 'name',
    header: () => (
      <RecordTable.InlineHead icon={IconImageInPicture} label="Name" />
    ),
    accessorKey: 'name',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-1">
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label="Owner Type" />
    ),
    accessorKey: 'ownerType',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 300,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconCheck} label="Status" />,
    cell: ({ cell }) => {
      const { _id } = cell.row.original || {};
      const currentStatus = cell.getValue() as string;
      const isActive = currentStatus === 'published';

      return (
        <RecordTableInlineCell>
          <Switch
            className="mx-auto"
            checked={isActive}
            onCheckedChange={() => {
              editStatus({
                variables: {
                  _id,
                  status: isActive ? 'unpublished' : 'published',
                },
              });
            }}
          />
        </RecordTableInlineCell>
      );
    },
  },
];
