import { IFacebookBot } from '@/integrations/facebook/types/FacebookBot';
import { useMutation } from '@apollo/client';
import { IconEdit, IconRefresh, IconX } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  Avatar,
  Button,
  RecordTable,
  RecordTableInlineCell,
  Spinner,
  toast,
  useQueryState,
} from 'erxes-ui';
import {
  REMOVE_FACEBOOK_BOT,
  REPAIR_FACEBOOK_BOT,
} from '~/widgets/automations/modules/facebook/components/bots/graphql/automationBotsMutations';

export const automationFacebookBotsColumns: ColumnDef<IFacebookBot>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          {cell.getValue() as string}
        </RecordTableInlineCell>
      );
    },
    size: 250,
  },
  {
    id: 'account',
    accessorKey: 'account',
    header: () => <RecordTable.InlineHead label="Account" />,
    cell: ({ cell }) => {
      const { name = '-' } = cell.getValue() || ({} as any);
      return <RecordTableInlineCell>{name}</RecordTableInlineCell>;
    },
    size: 235,
  },
  {
    id: 'page',
    accessorKey: 'page',
    header: () => <RecordTable.InlineHead label="Page" />,
    cell: ({ cell }) => {
      const { profileUrl = '' } = cell.row.original || {};
      const { name = '-' } = cell.getValue() || ({} as any);
      return (
        <RecordTableInlineCell className="w-full flex items-center justify-center">
          <Avatar>
            <Avatar.Image src={profileUrl} />
            <Avatar.Fallback>{name}</Avatar.Fallback>
          </Avatar>
          {name}
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'action-group',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ cell }) => {
      const { _id } = cell.row.original || {};
      const [_, setFacebookBotId] = useQueryState('facebookBotId');
      const [repairBot, { loading: loadingRepair }] = useMutation(
        REPAIR_FACEBOOK_BOT,
        {
          variables: { _id },
          onCompleted: () => toast({ title: 'Repaired successfully' }),
          onError: (error) =>
            toast({
              title: 'Something went wrong',
              description: error.message,
              variant: 'destructive',
            }),
        },
      );

      const [removeBot, { loading: loadingRemove }] = useMutation(
        REMOVE_FACEBOOK_BOT,
        {
          variables: { _id },
          onCompleted: () => toast({ title: 'Removed successfully' }),
          onError: (error) =>
            toast({
              title: 'Something went wrong',
              description: error.message,
              variant: 'destructive',
            }),
        },
      );

      return (
        <div className="flex items-center justify-center gap-1 [&>button]:px-2">
          <Button variant="ghost" onClick={() => setFacebookBotId(_id)}>
            <IconEdit />
          </Button>

          <Button
            disabled={loadingRepair}
            variant="ghost"
            onClick={() => repairBot()}
          >
            {loadingRepair ? <Spinner /> : <IconRefresh />}
          </Button>

          <Button
            disabled={loadingRemove}
            variant="ghost"
            onClick={() => removeBot()}
          >
            {loadingRemove ? <Spinner /> : <IconX />}
          </Button>
        </div>
      );
    },
  },
];
