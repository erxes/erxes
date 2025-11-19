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
} from 'erxes-ui';
import {
  IconAlignLeft,
  IconBrowser,
  IconCalendar,
  IconCheck,
  IconCopy,
  IconKey,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { useState } from 'react';

export const clientPortalColumns: ColumnDef<IClientPortal>[] = [
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
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.row.original.domain} />
        </RecordTableInlineCell>
      );
    },
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
        toast({
          title: 'Copied to clipboard',
        });
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      };

      return (
        <RecordTableInlineCell className="relative group" onClick={handleCopy}>
          <Badge variant="secondary">
            {cell.row.original.token
              ? `${cell.row.original.token.slice(
                  0,
                  4,
                )}•••${cell.row.original.token.slice(-3)}`
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
];
