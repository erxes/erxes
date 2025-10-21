import { IconPointerBolt, IconShare } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Avatar,
  Badge,
  cn,
  RecordTable,
  readImage,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Switch,
  Label,
  Popover,
} from 'erxes-ui';
import { Link } from 'react-router-dom';
import { TAutomationAction, TAutomationTrigger, SelectTags } from 'ui-modules';
import { IAutomation } from '@/automations/types';
import { IUser } from '@/settings/team-member/types';
import { useMutation } from '@apollo/client';
import { AUTOMATION_EDIT } from '@/automations/graphql/automationMutations';

const generateUserName = (user: IUser) => {
  if (user?.details?.firstName || user?.details?.lastName) {
    return `${user?.details?.firstName || ''} ${user?.details?.lastName || ''}`;
  }

  return user.email;
};

export const automationColumns: ColumnDef<IAutomation>[] = [
  {
    id: 'more',
    cell: ({ cell }) => {
      const { _id } = cell.row.original;
      return (
        <Link to={`/automations/edit/${_id}`}>
          <RecordTable.MoreButton className="w-full h-full" />
        </Link>
      );
    },
    size: 40,
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    minSize: 120,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ cell }) => {
      const status = cell.getValue() as 'active' | 'draft';
      const [edit] = useMutation(AUTOMATION_EDIT);
      return (
        <Popover>
          <RecordTableInlineCell.Trigger>
            <div className="w-full flex justify-center">
              <Badge
                variant={status === 'active' ? 'success' : 'secondary'}
                className={cn('font-bold', {
                  'text-accent-foreground': status !== 'active',
                })}
              >
                {status}
              </Badge>
            </div>
          </RecordTableInlineCell.Trigger>
          <RecordTableInlineCell.Content className="w-24 h-12 flex justify-center items-center space-x-2">
            <Label htmlFor="mode">Inactive</Label>
            <Switch
              id="mode"
              onCheckedChange={(open) =>
                edit({
                  variables: {
                    id: cell.row.original._id,
                    status: open ? 'active' : 'draft',
                  },
                })
              }
              checked={status === 'active'}
            />
          </RecordTableInlineCell.Content>
        </Popover>
      );
    },
    size: 80,
  },
  {
    id: 'triggers',
    accessorKey: 'triggers',
    header: () => <RecordTable.InlineHead label="Triggers" />,
    cell: ({ cell }) => {
      const triggers = (cell.getValue() || []) as TAutomationTrigger[];
      return (
        <RecordTableInlineCell>
          <IconPointerBolt size={12} />
          {triggers?.length}
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'actions',
    accessorKey: 'actions',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ cell }) => {
      const actions = (cell.getValue() || []) as TAutomationAction[];
      return (
        <RecordTableInlineCell>
          <IconShare size={12} />
          {actions?.length}
        </RecordTableInlineCell>
      );
    },
    size: 80,
  },
  {
    id: 'updatedUser',
    accessorKey: 'updatedUser',
    header: () => <RecordTable.InlineHead label="Last Updated By" />,
    cell: ({ cell }) => {
      const user = (cell.getValue() || {}) as IUser;
      const { details } = user;
      return (
        <RecordTableInlineCell>
          <Avatar className="h-6 w-6 rounded-full">
            <Avatar.Image
              src={readImage(details?.avatar)}
              alt={details?.fullName || ''}
            />
            <Avatar.Fallback className="rounded-lg text-black">
              {(details?.fullName || '').split('')[0]}
            </Avatar.Fallback>
          </Avatar>
          {generateUserName(user)}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdUser',
    accessorKey: 'createdUser',
    header: () => <RecordTable.InlineHead label="Created By" />,
    cell: ({ cell }) => {
      const user = (cell.getValue() || {}) as IUser;
      const { details } = user;
      return (
        <RecordTableInlineCell>
          <Avatar className="h-6 w-6 rounded-full">
            <Avatar.Image
              src={readImage(details?.avatar)}
              alt={details?.fullName || ''}
            />
            <Avatar.Fallback className="rounded-lg text-black">
              {(details?.fullName || '').split('')[0]}
            </Avatar.Fallback>
          </Avatar>
          {generateUserName(user)}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'updatedAt',
    accessorKey: 'updatedAt',
    header: () => <RecordTable.InlineHead label="Last Updated At" />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Created At" />,
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
  {
    id: 'tagIds',
    accessorKey: 'tagIds',
    header: () => <RecordTable.InlineHead label="Tags" />,
    cell: ({ cell }) => {
      return (
        <SelectTags.InlineCell
          tagType="core:automation"
          mode="multiple"
          value={cell.row.original.tagIds}
          targetIds={[cell.row.original._id]}
          options={(newSelectedTagIds) => ({
            update: (cache) => {
              cache.modify({
                id: cache.identify({
                  __typename: 'Automation',
                  _id: cell.row.original._id,
                }),
                fields: {
                  tagIds: () => newSelectedTagIds,
                },
              });
            },
          })}
        />
      );
    },
  },
];
