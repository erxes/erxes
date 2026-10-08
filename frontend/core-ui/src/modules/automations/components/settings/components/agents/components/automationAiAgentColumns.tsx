import {
  automationAiAgentMoreColumn,
  TAiAgentRecord,
} from '@/automations/components/settings/components/agents/components/AutomationAiAgentMoreColumn';
import { getAiAgentKind } from '@/automations/components/settings/components/agents/constants/automationAiAgents';
import { ColumnDef } from '@tanstack/table-core';
import { TFunction } from 'i18next';
import {
  Badge,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { ApprovalLockedBadge } from 'ui-modules';

const isValidDateValue = (value?: string) => {
  return !!value && !Number.isNaN(new Date(value).getTime());
};

export const automationAiAgentColumns = (
  t: TFunction,
): ColumnDef<TAiAgentRecord>[] => [
  automationAiAgentMoreColumn,
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label={t('name')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell className="truncate font-medium">
        {cell.getValue() as string}
      </RecordTableInlineCell>
    ),
    size: 260,
  },
  {
    id: 'visibility',
    header: () => <RecordTable.InlineHead label={t('visibility')} />,
    cell: ({ cell }) => {
      const lockState = cell.row.original.approvalLockState;
      const isPrivate = lockState?.locked === true;

      return (
        <RecordTableInlineCell>
          {isPrivate ? (
            <ApprovalLockedBadge state={lockState} />
          ) : (
            <Badge variant="secondary">{t('public')}</Badge>
          )}
        </RecordTableInlineCell>
      );
    },
    size: 120,
  },
  {
    id: 'provider',
    accessorFn: (row) => row.connection?.provider,
    header: () => (
      <RecordTable.InlineHead label={t('settings-agents-column-provider')} />
    ),
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
    header: () => (
      <RecordTable.InlineHead label={t('settings-agents-column-model')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell
        className="truncate text-sm text-muted-foreground"
        title={
          (cell.getValue() as string) || t('settings-agents-model-not-set')
        }
      >
        {(cell.getValue() as string) || t('settings-agents-model-not-set')}
      </RecordTableInlineCell>
    ),
    size: 180,
  },
  {
    id: 'description',
    accessorKey: 'description',
    header: () => <RecordTable.InlineHead label={t('description')} />,
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
    id: 'usage',
    accessorFn: (row) => row.usage?.total ?? 0,
    header: () => (
      <RecordTable.InlineHead label={t('settings-agents-used-by')} />
    ),
    cell: ({ cell }) => {
      const usage = cell.row.original.usage;
      const total = usage?.total ?? 0;

      if (!total) {
        return (
          <RecordTableInlineCell className="text-sm text-muted-foreground">
            {t('settings-agents-not-used')}
          </RecordTableInlineCell>
        );
      }

      const names = (usage?.automations || [])
        .map(
          ({ name, status }) => `${name || t('sidebar-untitled')} (${status})`,
        )
        .join('\n');

      return (
        <RecordTableInlineCell className="min-w-0" title={names}>
          <Badge variant="secondary">
            {total > 1
              ? t('settings-agents-usage-automations', { value: total })
              : t('settings-agents-usage-automation', { value: total })}
            {usage?.active
              ? ` · ${t('settings-agents-usage-active', {
                  value: usage.active,
                })}`
              : ''}
          </Badge>
        </RecordTableInlineCell>
      );
    },
    size: 200,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label={t('settings-agents-column-created')} />
    ),
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
