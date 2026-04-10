import {
  IconUser,
  IconStar,
  IconLabelFilled,
  IconHash,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { IScoreLog, IScoreLogItem, IScoreOwner } from '../types/score';
import { makeScoreMoreColumn } from './ScoreMoreColumn';

const ClickableScoreNumber = ({ item }: { item: IScoreLogItem }) => {
  const [, setNumber] = useQueryState<string>('scoreNumber');
  const number = item.target?.number;

  if (!number) return <RecordTableInlineCell />;

  return (
    <RecordTableInlineCell>
      <button
        type="button"
        className="cursor-pointer text-primary hover:underline bg-transparent border-0 p-0 text-left w-full"
        onClick={(e) => {
          e.stopPropagation();
          setNumber(number);
        }}
      >
        <TextOverflowTooltip value={number} />
      </button>
    </RecordTableInlineCell>
  );
};

const getOwnerName = (owner?: IScoreOwner, ownerType?: string): string => {
  if (!owner) return '';
  if (ownerType === 'user') {
    return (
      owner.details?.fullName ||
      [owner.details?.firstName, owner.details?.lastName]
        .filter(Boolean)
        .join(' ') ||
      ''
    );
  }
  if (ownerType === 'company') {
    return owner.primaryName || '';
  }
  return (
    [owner.firstName, owner.middleName, owner.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() || ''
  );
};

const getOwnerEmail = (owner?: IScoreOwner, ownerType?: string): string => {
  if (!owner) return '';
  if (ownerType === 'user') return owner.email || '';
  return owner.primaryEmail || '';
};

const getOwnerPhone = (owner?: IScoreOwner, ownerType?: string): string => {
  if (!owner) return '';
  if (ownerType === 'user') return owner.phone || '';
  return owner.primaryPhone || '';
};

const OwnerNameCell = ({
  row,
  onEdit,
}: {
  row: { original: IScoreLog };
  onEdit?: (record: IScoreLog) => void;
}) => {
  const { owner, ownerType } = row.original;
  const name = getOwnerName(owner, ownerType);

  if (!name) return <RecordTableInlineCell>{name}</RecordTableInlineCell>;

  return (
    <RecordTableInlineCell>
      <button
        type="button"
        className="cursor-pointer bg-transparent border-0 p-0 text-inherit text-left w-full"
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.(row.original);
        }}
      >
        {name}
      </button>
    </RecordTableInlineCell>
  );
};

export const makeScoreColumns = (
  onEdit?: (record: IScoreLog) => void,
): ColumnDef<IScoreLog>[] => [
  makeScoreMoreColumn(onEdit) as ColumnDef<IScoreLog>,
  {
    id: 'number',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Number" />,
    size: 140,
    cell: ({ row }) => {
      const logs = row.original.logs || [];
      const first = logs.find((l) => l.target?.number);
      return (
        <ClickableScoreNumber
          item={first || logs[0] || ({} as IScoreLogItem)}
        />
      );
    },
  },
  {
    id: 'ownerName',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Owner Name" />,
    size: 180,
    cell: ({ row }) => <OwnerNameCell row={row} onEdit={onEdit} />,
  },
  {
    id: 'email',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Email" />,
    size: 200,
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        {getOwnerEmail(row.original.owner, row.original.ownerType)}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'phone',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Phone" />,
    size: 150,
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        {getOwnerPhone(row.original.owner, row.original.ownerType)}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconLabelFilled} label="Owner Type" />
    ),
    size: 120,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="capitalize text-xs">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'totalScore',
    accessorKey: 'totalScore',
    header: () => (
      <RecordTable.InlineHead icon={IconStar} label="Total Score" />
    ),
    size: 120,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="font-semibold">
        {cell.getValue() as number}
      </RecordTableInlineCell>
    ),
  },
];
