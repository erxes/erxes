import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { ColumnDef } from '@tanstack/table-core';
import {
  Avatar,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  readImage,
} from 'erxes-ui';
import { FacebookBotHealthCell } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotHealthCell';
import { facebookBotMoreColumn } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotMoreColumn';

const getBotUserLabel = (
  user?: IFacebookBot['createdUser'],
  fallback?: string,
) =>
  user?.details?.fullName || user?.email || user?.username || fallback || '-';

const FacebookBotUserCell = ({
  user,
  fallback,
}: {
  user?: IFacebookBot['createdUser'];
  fallback?: string;
}) => {
  const label = getBotUserLabel(user, fallback);
  const avatar = user?.details?.avatar;

  return (
    <RecordTableInlineCell className="min-w-0" title={label}>
      <div className="flex min-w-0 items-center gap-2">
        <Avatar className="size-6">
          <Avatar.Image src={avatar ? readImage(avatar, 40) : ''} />
          <Avatar.Fallback>{label[0]}</Avatar.Fallback>
        </Avatar>
        <span className="truncate">{label}</span>
      </div>
    </RecordTableInlineCell>
  );
};

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
      return (
        <RecordTableInlineCell className="truncate">
          {name}
        </RecordTableInlineCell>
      );
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
      <FacebookBotHealthCell
        health={cell.getValue() as IFacebookBot['health']}
      />
    ),
    size: 150,
  },
  {
    id: 'createdBy',
    accessorFn: (row) => row.createdUser,
    header: () => <RecordTable.InlineHead label="Created By" />,
    cell: ({ cell }) => (
      <FacebookBotUserCell
        user={cell.getValue() as IFacebookBot['createdUser']}
        fallback={cell.row.original.createdBy}
      />
    ),
    size: 180,
  },
  {
    id: 'updatedBy',
    accessorFn: (row) => row.updatedUser,
    header: () => <RecordTable.InlineHead label="Updated By" />,
    cell: ({ cell }) => (
      <FacebookBotUserCell
        user={cell.getValue() as IFacebookBot['updatedUser']}
        fallback={cell.row.original.updatedBy}
      />
    ),
    size: 180,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Created" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="truncate text-sm">
        <RelativeDateDisplay value={cell.getValue() as string}>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RelativeDateDisplay>
      </RecordTableInlineCell>
    ),
    size: 160,
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => <RecordTable.InlineHead label="Updated" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="truncate text-sm">
        <RelativeDateDisplay value={cell.getValue() as string}>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RelativeDateDisplay>
      </RecordTableInlineCell>
    ),
    size: 160,
  },
];
