import { IconTag, IconToggleLeft, IconLabelFilled } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Switch,
} from 'erxes-ui';
import { ScoreNameCell } from '../score-detail/components/ScoreNameCell';
import { IScore } from '../types/loyaltyScoreTypes';
import { scoreMoreColumn } from './LoyaltyScoreMoreColumn';

export const scoreColumns: (
  editStatus: (options: any) => void,
) => ColumnDef<IScore>[] = (editStatus) => [
  scoreMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IScore>,

  {
    id: 'title',
    accessorKey: 'title',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Title" />,
    cell: ({ cell }: { cell: any }) => {
      return (
        <ScoreNameCell
          score={cell.row.original}
          name={cell.getValue() as string}
        />
      );
    },
    size: 150,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label="Owner Type" />
    ),
    cell: ({ cell }: { cell: any }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 150,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => (
      <RecordTable.InlineHead icon={IconToggleLeft} label="Status" />
    ),
    cell: ({ cell }) => {
      const { _id } = cell.row.original || {};
      const currentStatus = cell.getValue() as string;
      const isActive = currentStatus === 'active';

      return (
        <RecordTableInlineCell>
          <Switch
            className="mx-auto"
            checked={isActive}
            onCheckedChange={() => {
              editStatus({
                variables: {
                  _id,
                  kind: 'score',
                  status: isActive ? 'inactive' : 'active',
                },
              });
            }}
          />
        </RecordTableInlineCell>
      );
    },
    size: 100,
  },
];
