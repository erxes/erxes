import { IChannel, IChannelMember } from '@/channels/types';
import { CellContext, ColumnDef } from '@tanstack/table-core';
import { MembersInline } from 'ui-modules';
import { channelsMoreColumn } from './ChannelsMoreColumn';
import { IntegrationChips } from './IntegrationChips';
import { RecordTable, RecordTableInlineCell, Tooltip } from 'erxes-ui';
import {
  IconAlignLeft,
  IconCalendarPlus,
  IconCircleCheck,
  IconFileDescription,
  IconForms,
  IconLayoutKanban,
  IconMessageReply,
  IconPlugConnected,
  IconUsers,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ChannelNameCell = ({ cell }: CellContext<IChannel, unknown>) => {
  const { _id } = cell.row.original;
  const navigate = useNavigate();

  const onClick = () => {
    navigate(`/settings/frontline/channels/${_id}`);
  };

  return (
    <RecordTableInlineCell onClick={onClick}>
      {cell.getValue() as string}
    </RecordTableInlineCell>
  );
};

const CountCell = ({ count }: { count?: number }) => {
  return <RecordTableInlineCell>{count ?? 0}</RecordTableInlineCell>;
};

const DateDisplay = ({ date }: { date: string }) => {
  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger>
          <div className="text-muted-foreground text-xs">
            {date ? format(new Date(date), 'MMM d, yyyy') : ''}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {format(new Date(date), 'MMM d, yyyy HH:mm')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

export const useChannelsColumns = (
  membersByChannel: Record<string, IChannelMember[]> = {},
): ColumnDef<IChannel>[] => {
  const { t } = useTranslation('frontline');

  return [
    channelsMoreColumn,
    RecordTable.checkboxColumn as ColumnDef<IChannel>,
    {
      id: 'name',
      accessorKey: 'name',
      header: () => (
        <RecordTable.InlineHead
          label={t('col-title', 'title')}
          icon={IconAlignLeft}
        />
      ),
      cell: ChannelNameCell,
      size: 220,
    },
    {
      id: 'description',
      accessorKey: 'description',
      header: () => (
        <RecordTable.InlineHead
          label={t('description', 'Description')}
          icon={IconFileDescription}
        />
      ),
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell className="text-muted-foreground">
            <span className="truncate">{cell.getValue() as string}</span>
          </RecordTableInlineCell>
        );
      },
      size: 220,
    },
    {
      id: 'memberCount',
      accessorKey: 'memberCount',
      header: () => (
        <RecordTable.InlineHead
          label={t('col-members', 'members')}
          icon={IconUsers}
        />
      ),
      cell: ({ cell }) => {
        const { _id } = cell.row.original;
        const memberUsers = (membersByChannel[_id] ?? [])
          .map((channelMember) => channelMember.member)
          .filter((member) => member && member.isActive !== false);

        if (memberUsers.length === 0) {
          return (
            <RecordTableInlineCell>
              {(cell.getValue() as number) ?? 0}
            </RecordTableInlineCell>
          );
        }

        return (
          <RecordTableInlineCell>
            <MembersInline.Provider members={memberUsers} size="sm">
              <MembersInline.Avatar size="sm" />
            </MembersInline.Provider>
          </RecordTableInlineCell>
        );
      },
      size: 140,
    },
    {
      id: 'pipelineCount',
      accessorKey: 'pipelineCount',
      header: () => (
        <RecordTable.InlineHead
          label={t('pipelines', 'Pipelines')}
          icon={IconLayoutKanban}
        />
      ),
      cell: ({ cell }) => {
        return <CountCell count={cell.getValue() as number} />;
      },
      size: 110,
    },
    {
      id: 'formCount',
      accessorKey: 'formCount',
      header: () => (
        <RecordTable.InlineHead label={t('forms', 'Forms')} icon={IconForms} />
      ),
      cell: ({ cell }) => {
        return <CountCell count={cell.getValue() as number} />;
      },
      size: 110,
    },
    {
      id: 'responseTemplateCount',
      accessorKey: 'responseTemplateCount',
      header: () => (
        <RecordTable.InlineHead
          label={t('templates', 'Templates')}
          icon={IconMessageReply}
        />
      ),
      cell: ({ cell }) => {
        return <CountCell count={cell.getValue() as number} />;
      },
      size: 110,
    },
    {
      id: 'integrationCount',
      accessorKey: 'integrationCount',
      header: () => (
        <RecordTable.InlineHead
          label={t('integrations', 'Integrations')}
          icon={IconPlugConnected}
        />
      ),
      cell: ({ cell }) => {
        const { integrationKinds } = cell.row.original;
        const count = (cell.getValue() as number) ?? 0;

        return (
          <RecordTableInlineCell className="gap-2">
            {count}
            {integrationKinds?.length ? (
              <IntegrationChips kinds={integrationKinds} />
            ) : null}
          </RecordTableInlineCell>
        );
      },
      size: 260,
    },
    {
      id: 'status',
      header: () => (
        <RecordTable.InlineHead
          label={t('status', 'Status')}
          icon={IconCircleCheck}
        />
      ),
      cell: () => {
        return (
          <RecordTableInlineCell className="gap-1.5">
            <span className="size-1.5 rounded-full bg-success" />
            {t('active', 'Active')}
          </RecordTableInlineCell>
        );
      },
      size: 110,
    },
    {
      id: 'createdAt',
      accessorKey: 'createdAt',
      header: () => (
        <RecordTable.InlineHead
          label={t('col-created-at', 'created at')}
          icon={IconCalendarPlus}
        />
      ),
      cell: ({ cell }) => {
        return (
          <RecordTableInlineCell className="justify-center">
            <DateDisplay date={cell.getValue() as string} />
          </RecordTableInlineCell>
        );
      },
      size: 120,
    },
  ];
};
