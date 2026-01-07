import { ColumnDef } from '@tanstack/react-table';
import {
  Avatar,
  Input,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RecordTableTree,
} from 'erxes-ui';
import { useLoyaltyScore } from '../hooks/useLoyaltyScore';
import {
  IconImageInPicture,
  IconLabelFilled,
  IconPackage,
} from '@tabler/icons-react';
import { useMemo } from 'react';
import { loyaltyScoreMoreColumn } from './LoyaltyScoreMoreColumn';
import { LoyaltyScoreCommandBar } from './loyalty-score-command-bar/LoyaltyScoreCommandBar';
import { LOYALTY_SCORE_PER_PAGE } from '../hooks/useLoyaltyScore';

export const LoyaltyScoreRecordTable = () => {
  const { scoreCampaigns, loading } = useLoyaltyScore();

  const categories = scoreCampaigns?.map((category: any) => ({
    ...category,
    hasChildren: scoreCampaigns?.some((c: any) => c.parentId === category._id),
  }));

  const categoryObject = useMemo(() => {
    return categories?.reduce((acc: Record<string, any>, category: any) => {
      acc[category._id] = category;
      return acc;
    }, {});
  }, [categories]);

  return (
    <RecordTable.Provider
      columns={loyaltyScoreColumns(categoryObject || {})}
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
) => ColumnDef<any & { hasChildren: boolean }>[] = (categoryObject) => [
  loyaltyScoreMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<any & { hasChildren: boolean }>,
  {
    id: 'title',
    header: () => (
      <RecordTable.InlineHead icon={IconImageInPicture} label="Title" />
    ),
    accessorKey: 'title',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="px-1 justify-center">
          <Avatar>
            <Avatar.Image src={(cell.getValue() as any)?.url || ''} />
            <Avatar.Fallback>
              {cell.row.original.title.charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label="Name" />
    ),
    accessorKey: 'ownerType',
    cell: ({ cell }) => {
      return (
        <Popover>
          <RecordTableInlineCell.Trigger>
            <RecordTableTree.Trigger
              order={cell.row.original.order}
              name={cell.getValue() as string}
              hasChildren={cell.row.original.hasChildren}
            >
              {cell.getValue() as string}
            </RecordTableTree.Trigger>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content>
            <Input value={cell.getValue() as string} />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 300,
  },

  {
    id: 'status',
    header: () => <RecordTable.InlineHead icon={IconPackage} label="status" />,
    accessorKey: 'status',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'action',
    header: () => <RecordTable.InlineHead icon={IconPackage} label="Action" />,
    accessorKey: 'action',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
  },
];
