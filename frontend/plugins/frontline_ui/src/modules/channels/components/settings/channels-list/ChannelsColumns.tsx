import { IChannel } from '@/channels/types';
import { ColumnDef } from '@tanstack/table-core';
import { channelsMoreColumn } from './ChannelsMoreColumn';
import { IconComponent, RecordTableInlineCell, Tooltip } from 'erxes-ui';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export const channelsColumns: ColumnDef<IChannel>[] = [
  channelsMoreColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: 'title',
    cell: ({ cell }) => {
      const { icon, _id } = cell.row.original;

      const navigate = useNavigate();
      const onClick = () => {
        navigate(`/settings/frontline/channels/${_id}`);
      };
      return (
        <RecordTableInlineCell onClick={onClick}>
          <IconComponent name={icon} size={16} />
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 400,
  },
  {
    id: 'memberCount',
    accessorKey: 'memberCount',
    header: 'members',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="justify-end">
          {cell.getValue() as number}
        </RecordTableInlineCell>
      );
    },
    size: 90,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: 'created at',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="justify-center">
          <DateDisplay date={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: 'updated at',
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="justify-center">
          <DateDisplay date={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
];

export const DateDisplay = ({ date }: { date: string }) => {
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>
          <div className="text-muted-foreground text-xs">
            {date ? format(new Date(date), 'MMM d, yyyy') : ''}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(new Date(date), 'MMM d, yyyy HH:mm')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
