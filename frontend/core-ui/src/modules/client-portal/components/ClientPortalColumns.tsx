import { ColumnDef } from '@tanstack/table-core';
import { IClientPortal } from '@/client-portal/types/clientPortal';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  TextOverflowTooltip,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  IconAlignLeft,
  IconBrowser,
  IconCalendar,
  IconCheck,
  IconCopy,
  IconKey,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { useState } from 'react';
import { clientPortalMoreColumn } from './ClientPortalMoreColumn';
import { useMutation } from '@apollo/client';

import { CLIENT_PORTAL_DELETE } from '@/client-portal/graphql/mutations/clientPortalDelete';

export const clientPortalColumns: ColumnDef<IClientPortal>[] = [
  clientPortalMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IClientPortal>,

  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead icon={IconAlignLeft} label="Name" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Link
            to={
              '/' +
              SettingsPath.Index +
              SettingsWorkspacePath.ClientPortals +
              '/' +
              cell.row.original._id
            }
          >
            <Badge variant="secondary">
              <TextOverflowTooltip value={cell.row.original.name} />
            </Badge>
          </Link>
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'domain',
    accessorKey: 'domain',
    header: () => <RecordTable.InlineHead icon={IconBrowser} label="Domain" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={cell.row.original.domain} />
      </RecordTableInlineCell>
    ),
  },

  {
    id: 'token',
    accessorKey: 'token',
    header: () => <RecordTable.InlineHead icon={IconKey} label="Token" />,
    cell: ({ cell }) => {
      const [isCopied, setIsCopied] = useState(false);

      const handleCopy = () => {
        setIsCopied(true);
        navigator.clipboard.writeText(cell.row.original.token ?? '');
        toast({ title: 'Copied to clipboard' });
        setTimeout(() => setIsCopied(false), 2000);
      };

      return (
        <RecordTableInlineCell className="relative group" onClick={handleCopy}>
          <Badge variant="secondary">
            {cell.row.original.token
              ? `${cell.row.original.token.slice(0, 4)}•••${cell.row.original.token.slice(-3)}`
              : ''}
          </Badge>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-1 top-1 size-6 hidden group-hover:flex"
          >
            {isCopied ? <IconCheck /> : <IconCopy />}
          </Button>
        </RecordTableInlineCell>
      );
    },
  },

  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconCalendar} label="Created At" />
    ),
    cell: ({ cell }) => (
      <RelativeDateDisplay value={cell.getValue() as string} asChild>
        <RecordTableInlineCell>
          <RelativeDateDisplay.Value value={cell.getValue() as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },

  // NEW: Actions column (EDIT + DELETE)
  {
    id: 'actions',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: ({ row }) => {
      const portal = row.original;
      const navigate = useNavigate();
      const { confirm } = useConfirm();
      const [clientPortalDelete] = useMutation(CLIENT_PORTAL_DELETE);

      const handleEdit = () => {
        navigate(
          '/' +
            SettingsPath.Index +
            SettingsWorkspacePath.ClientPortals +
            '/' +
            portal._id
        );
      };

      const handleDelete = () => {
        confirm({
          message: 'Delete client portal?',
          options: {
            description: 'This action cannot be undone.',
            okLabel: 'Delete',
            cancelLabel: 'Cancel',
          },
        }).then(() => {
          clientPortalDelete({
            variables: { _id: portal._id },
            refetchQueries: ['getClientPortals'],
          });
        });
      };

      return (
        <RecordTableInlineCell className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={handleEdit}>
            <IconEdit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500"
            onClick={handleDelete}
          >
            <IconTrash size={16} />
          </Button>
        </RecordTableInlineCell>
      );
    },
  },
];
