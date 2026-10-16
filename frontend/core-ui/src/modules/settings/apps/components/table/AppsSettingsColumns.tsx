import { useTranslation } from 'react-i18next';
import { IApp } from '@/settings/apps/types';
import { useAppsEdit } from '@/settings/apps/hooks/useAppsEdit';
import { ColumnDef } from '@tanstack/table-core';
import { TFunction } from 'i18next';
import { Cell } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Badge,
  Button,
  Input,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  useToast,
} from 'erxes-ui';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import { useState } from 'react';

const AppNameCell = ({ cell }: { cell: Cell<IApp, unknown> }) => {
  const { _id, name } = cell.row.original;
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(name);
  const { appsEdit, loading } = useAppsEdit();
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const { toast } = useToast();

  const onSave = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setValue(name);
      return;
    }
    if (trimmed !== name) {
      appsEdit({
        variables: { _id, name: trimmed },
        onError: (error) => {
          setValue(name);
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) onSave();
      }}
    >
      <RecordTableInlineCell.Trigger>{name}</RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content
        style={{ width: 'calc(var(--radix-popover-trigger-width))' }}
        onCloseAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          onFocus={(e) => {
            const input = e.target;
            const length = input.value.length;
            setTimeout(() => {
              input.setSelectionRange(length, length);
            }, 0);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSave();
              setOpen(false);
            }
          }}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};

const TokenCell = ({ token }: { token: string }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'apps' });
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const masked = `${token.slice(0, 6)}...................`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      toast({
        variant: 'success',
        title: t('token-copied'),
      });
      setTimeout(() => setCopied(false), 1000);
    } catch {
      toast({
        variant: 'destructive',
        title: t('failed-to-copy-token'),
      });
    }
  };

  return (
    <RecordTableInlineCell
      className="group justify-between"
      onClick={handleCopy}
    >
      <span className="font-mono text-xs">{masked}</span>
      <Button variant="ghost" size="icon" className="hidden group-hover:flex">
        {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
      </Button>
    </RecordTableInlineCell>
  );
};

export const appsSettingsColumns = (t: TFunction): ColumnDef<IApp>[] => [
  { ...RecordTable.checkboxColumn, size: 33 } as ColumnDef<IApp>,
  {
    id: 'name',
    accessorKey: 'name',
    header: t('app-name'),
    cell: ({ cell }) => <AppNameCell cell={cell} />,
  },
  {
    id: 'token',
    accessorKey: 'token',
    header: t('token'),
    cell: ({ cell }) => <TokenCell token={cell.getValue() as string} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: t('status'),
    cell: ({ cell }) => {
      const status = cell.getValue() as string;
      return (
        <RecordTableInlineCell>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status}
          </Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: t('created-at'),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        {format(new Date(cell.getValue() as string), 'yyyy/MM/dd') ||
          'YYYY/MM/DD'}
      </RecordTableInlineCell>
    ),
  },
];
