import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { ColumnDef } from '@tanstack/table-core';
import {
  Avatar,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import { FacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotHealthCell';
import { facebookBotMoreColumn } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotMoreColumn';

export const automationFacebookBotsColumns: ColumnDef<IFacebookBot>[] = [
    facebookBotMoreColumn(),
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="truncate font-medium">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
    size: 280,
  },
  {
    id: 'account',
    accessorKey: 'account',
    header: () => <RecordTable.InlineHead label="Account" />,
    cell: ({ cell }) => {
      const { name = '-' } = cell.getValue() || ({} as any);
      return <RecordTableInlineCell className="truncate">{name}</RecordTableInlineCell>;
    },
    size: 180,
  },
  {
    id: 'page',
    accessorKey: 'page',
    header: () => <RecordTable.InlineHead label="Page" />,
    cell: ({ cell }) => {
      const { profileUrl = '' } = cell.row.original || {};
      const { name = '-' } = cell.getValue() || ({} as any);
      return (
        <RecordTableInlineCell className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar>
            <Avatar.Image src={profileUrl} />
            <Avatar.Fallback>{name}</Avatar.Fallback>
            </Avatar>
            <span className="truncate">{name}</span>
          </div>
        </RecordTableInlineCell>
      );
    },
    size: 190,
  },
  {
    id: 'health',
    accessorKey: 'health',
    header: () => <RecordTable.InlineHead label="Health" />,
    cell: ({ cell }) => (
      <FacebookBotHealthCell health={cell.getValue() as IFacebookBot['health']} />
    ),
    size: 150,
  },

];
