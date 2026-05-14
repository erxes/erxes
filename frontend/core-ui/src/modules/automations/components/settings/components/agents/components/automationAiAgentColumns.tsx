import {
  automationAiAgentMoreColumn,
  TAiAgentRecord,
} from '@/automations/components/settings/components/agents/components/AutomationAiAgentMoreColumn';
import { getAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';

const isValidDateValue = (value?: string) => {
  return !!value && !Number.isNaN(new Date(value).getTime());
};

export const automationAiAgentColumns: ColumnDef<TAiAgentRecord>[] = [
  automationAiAgentMoreColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="truncate font-medium">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'provider',
    accessorFn: (row) => row.connection?.provider,
    header: () => <RecordTable.InlineHead label="Provider" />,
    cell: ({ cell }) => {
      const provider = getAiAgentKind(cell.getValue() as string | undefined);

      return (
        <RecordTableInlineCell className="min-w-0">
          <Badge variant="secondary" className="w-fit">
            {provider.label}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 180,
  },
  {
    id: 'model',
    accessorFn: (row) => row.connection?.model,
    header: () => <RecordTable.InlineHead label="Model" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell
        className="truncate text-sm text-muted-foreground"
        title={(cell.getValue() as string) || 'Model not set'}
      >
        {(cell.getValue() as string) || 'Model not set'}
      </RecordTableInlineCell>
    ),
    size: 180,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label="Description" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell
        className="truncate text-sm text-muted-foreground"
        title={(cell.getValue() as string) || '-'}
      >
        {(cell.getValue() as string) || '-'}
      </RecordTableInlineCell>
    ),
    size: 320,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => <RecordTable.InlineHead label="Created" />,
    cell: ({ cell }) => {
      const createdAt = cell.getValue() as string;

      return (
        <RecordTableInlineCell className="truncate text-sm">
          {isValidDateValue(createdAt) ? (
            <RelativeDateDisplay value={createdAt}>
              <RelativeDateDisplay.Value value={createdAt} />
            </RelativeDateDisplay>
          ) : (
            '-'
          )}
        </RecordTableInlineCell>
      );
    },
    size: 160,
  },
];
