import React from 'react';
import { useParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/table-core';
import { useIntegrations } from '../hooks/useIntegrations';
import { IIntegrationColumnDef, IIntegrationItem } from '../types/integration';
import {
  Badge,
  Button,
  RecordTable,
  RecordTableInlineCell,
  Skeleton,
} from 'erxes-ui';

import {
  IconArchive,
  IconEdit,
  IconHexagonPlusFilled,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { INTEGRATIONS, OTHER_INTEGRATIONS } from '../constants/integrations';
import { useIntegrationsCounts } from '../hooks/useIntegrationsCounts';
import { AddIntegration } from './add-integration/AddIntegration';

export const IntegrationsList = () => {
  const params = useParams();
  const integrationsList: Record<string, IIntegrationItem> = {
    ...INTEGRATIONS,
    ...OTHER_INTEGRATIONS,
  };
  const integration =
    integrationsList[params.kind as keyof typeof integrationsList];

  const { totalCount } = useIntegrationsCounts();
  const { integrations, loading, error } = useIntegrations({
    variables: {
      kind: params?.kind,
      channelId: params?.channelId,
    },
    skip: !params?.kind,
  });

  if (loading) {
    return <Skeleton className="w-full h-auto aspect-[9/2]" />;
  }

  if (error) {
    return <code>{error.message}</code>;
  }

  if (integrations.length) {
    return (
      <div className="w-full h-auto flex flex-col gap-3">
        <strong className="text-base font-semibold tracking-normal">
          {totalCount || 0} {integration.label} integrations
        </strong>
        <RecordTable.Provider
          columns={integrationTypeColumns}
          data={integrations || []}
        >
          <RecordTable.Scroll>
            <RecordTable>
              <RecordTable.Header />
              <RecordTable.Body>
                <RecordTable.RowList />
              </RecordTable.Body>
            </RecordTable>
          </RecordTable.Scroll>
        </RecordTable.Provider>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-dashed border-sidebar-border bg-sidebar p-3 gap-3 flex flex-col items-center justify-center w-full h-auto aspect-[9/2]">
      <IconHexagonPlusFilled size={30} className="text-accent-foreground" />
      <AddIntegration>
        <Button variant={'outline'} className="text-sm">
          Add messenger integration
        </Button>
      </AddIntegration>
      <span className="text-accent-foreground text-sm">
        Connect and manage Facebook Messages right from your Team Inbox
      </span>
    </div>
  );
};

export const integrationTypeColumns: ColumnDef<IIntegrationColumnDef>[] = [
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
    id: 'kind',
    accessorKey: 'kind',
    header: () => <RecordTable.InlineHead label="Kind" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell className="w-full flex items-center justify-center">
          <Badge className="text-xs">{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'isActive',
    accessorKey: 'isActive',
    header: () => <RecordTable.InlineHead label="Status" />,
    cell: ({ cell }) => {
      const status = cell.getValue() as boolean;

      if (status) {
        return (
          <RecordTableInlineCell className="w-full flex items-center justify-center">
            <Badge className="text-xs capitalize" variant={'success'}>
              Active
            </Badge>
          </RecordTableInlineCell>
        );
      } else
        return (
          <RecordTableInlineCell>
            <Badge className="text-xs" variant={'destructive'}>
              Inactive
            </Badge>
          </RecordTableInlineCell>
        );
    },
    size: 100,
  },
  {
    id: 'healthStatus',
    accessorKey: 'healthStatus',
    header: () => <RecordTable.InlineHead label="Health status" />,
    cell: ({ cell }) => {
      const { status } =
        cell.getValue() as IIntegrationColumnDef['healthStatus'];

      if (status === 'healthy') {
        return (
          <RecordTableInlineCell className="w-full flex items-center justify-center">
            <Badge className="text-xs capitalize" variant={'success'}>
              {status}
            </Badge>
          </RecordTableInlineCell>
        );
      } else
        return (
          <RecordTableInlineCell>
            <Badge className="text-xs" variant={'destructive'}>
              {'Unhealthy'}
            </Badge>
          </RecordTableInlineCell>
        );
    },
    size: 120,
  },
  {
    id: 'action-group',
    header: () => <RecordTable.InlineHead label="Actions" />,
    cell: () => {
      return (
        <div className="flex items-center justify-center gap-1 [&>button]:px-2">
          <Button variant={'outline'}>
            <IconSettings size={12} />
          </Button>
          <Button variant={'outline'}>
            <IconArchive size={12} />
          </Button>
          <Button variant={'outline'}>
            <IconEdit size={12} />
          </Button>
          <Button
            variant={'outline'}
            className="text-destructive bg-destructive/10"
          >
            <IconTrash size={12} />
          </Button>
        </div>
      );
    },
  },
];
