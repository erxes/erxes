import {
  IconAlignLeft,
  IconBook,
  IconInbox,
  IconLabelFilled,
  IconLayoutKanban,
  IconMenu2,
  IconProgressCheck,
  IconTicket,
  IconWorld,
} from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { Cell, ColumnDef } from '@tanstack/react-table';
import clsx from 'clsx';
import {
  Badge,
  Combobox,
  Command,
  Input,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  Switch,
  TextOverflowTooltip,
  useQueryState,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { ReactNode, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { helpCenterMoreColumn } from '@/helpcenter/components/HelpCenterMoreColumn';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';
import { SelectTriggerTicket } from '@/ticket/components/ticket-selects/SelectTicket';
import {
  THelpCenterPatch,
  useEditHelpCenter,
} from '@/helpcenter/hooks/useEditHelpCenter';
import { HelpCenterHotKeyScope, IHelpCenter } from '@/helpcenter/types';
import { TOPICS_SHORT } from '@/knowledgebase/graphql/queries';

const cellScope = (helpCenter: IHelpCenter, field: string) =>
  clsx(HelpCenterHotKeyScope.HelpCentersPage, helpCenter._id, field);

const InlineTextCell = ({
  cell,
  field,
  placeholder,
  children,
}: {
  cell: Cell<IHelpCenter, unknown>;
  field: keyof THelpCenterPatch;
  placeholder?: string;
  children?: ReactNode;
}) => {
  const helpCenter = cell.row.original;
  const savedValue = (cell.getValue() as string) || '';
  const [value, setValue] = useState(savedValue);
  const { editHelpCenter } = useEditHelpCenter();

  const saved = useRef(false);

  const handleSave = () => {
    if (saved.current) return;

    const next = value.trim();

    if (next === savedValue) return;

    saved.current = true;
    editHelpCenter(helpCenter, { [field]: next });
  };

  return (
    <PopoverScoped
      scope={cellScope(helpCenter, field)}
      closeOnEnter
      onOpenChange={(open) => {
        if (open) {
          setValue(savedValue);
          saved.current = false;
          return;
        }
        handleSave();
      }}
    >
      <RecordTableInlineCell.Trigger>
        {children ?? <TextOverflowTooltip value={savedValue || placeholder} />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content className="min-w-72">
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              handleSave();
            }
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

const FeatureLabelCell = ({
  cell,
  field,
  feature,
}: {
  cell: Cell<IHelpCenter, unknown>;
  field: 'kbLabel' | 'ticketLabel';
  feature: 'kbToggle' | 'ticketToggle';
}) => {
  const enabled = Boolean(cell.row.original[feature]);
  const value = (cell.getValue() as string) || '';

  return (
    <InlineTextCell cell={cell} field={field}>
      <TextOverflowTooltip
        value={value}
        className={clsx(!enabled && 'text-muted-foreground/60 line-through')}
      />
    </InlineTextCell>
  );
};

const KbTopicCell = ({ cell }: { cell: Cell<IHelpCenter, unknown> }) => {
  const { t } = useTranslation('frontline');
  const helpCenter = cell.row.original;
  const { editHelpCenter } = useEditHelpCenter();
  const [open, setOpen] = useState(false);

  const { data, loading } = useQuery<{
    knowledgeBaseTopics: { _id: string; title?: string }[];
  }>(TOPICS_SHORT, { variables: { page: 1, perPage: 100 } });

  const topics = (data?.knowledgeBaseTopics ?? []).filter(
    (topic) => topic._id !== helpCenter._id,
  );
  const selected = topics.find((topic) => topic._id === helpCenter.kbTopicId);

  return (
    <PopoverScoped
      scope={cellScope(helpCenter, 'kbTopicId')}
      open={open}
      onOpenChange={setOpen}
    >
      <SelectTriggerTicket variant="table">
        <TextOverflowTooltip
          value={selected?.title || t('select-topic', 'Select a topic')}
        />
      </SelectTriggerTicket>
      <Combobox.Content>
        <Command>
          <Command.Input placeholder={t('search-topics', 'Search topics')} />
          <Command.List>
            <Combobox.Empty loading={loading} />
            {topics.map((topic) => (
              <Command.Item
                key={topic._id}
                value={topic._id}
                onSelect={() => {
                  editHelpCenter(helpCenter, { kbTopicId: topic._id });
                  setOpen(false);
                }}
              >
                <TextOverflowTooltip
                  value={topic.title || t('unnamed-topic')}
                />
                <Combobox.Check checked={helpCenter.kbTopicId === topic._id} />
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </Combobox.Content>
    </PopoverScoped>
  );
};

const TicketChannelCell = ({ cell }: { cell: Cell<IHelpCenter, unknown> }) => {
  const helpCenter = cell.row.original;
  const { editHelpCenter } = useEditHelpCenter();

  return (
    <SelectChannel
      variant="table"
      value={helpCenter.ticketChannelId ?? ''}
      scope={cellScope(helpCenter, 'ticketChannelId')}
      onValueChange={(value) =>
        editHelpCenter(helpCenter, { ticketChannelId: value })
      }
    />
  );
};

const TicketPipelineCell = ({ cell }: { cell: Cell<IHelpCenter, unknown> }) => {
  const helpCenter = cell.row.original;
  const { editHelpCenter } = useEditHelpCenter();
  const channelId = helpCenter.ticketChannelId;

  return (
    <SelectPipeline
      variant="table"
      value={helpCenter.ticketPipelineId ?? ''}
      channelId={channelId || undefined}
      disabled={!channelId}
      scope={cellScope(helpCenter, 'ticketPipelineId')}
      onValueChange={(value) =>
        editHelpCenter(helpCenter, { ticketPipelineId: value })
      }
    />
  );
};

const TicketStatusCell = ({ cell }: { cell: Cell<IHelpCenter, unknown> }) => {
  const helpCenter = cell.row.original;
  const { editHelpCenter } = useEditHelpCenter();
  const [open, setOpen] = useState(false);
  const pipelineId = helpCenter.ticketPipelineId;

  return (
    <SelectStatusTicket.Provider
      value={helpCenter.ticketStatusId ?? ''}
      pipelineId={pipelineId || undefined}
      onValueChange={(status) => {
        editHelpCenter(helpCenter, { ticketStatusId: status as string });
        setOpen(false);
      }}
    >
      <PopoverScoped
        scope={cellScope(helpCenter, 'ticketStatusId')}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTriggerTicket variant="table" disabled={!pipelineId}>
          <SelectStatusTicket.Value />
        </SelectTriggerTicket>
        <Combobox.Content>
          <SelectStatusTicket.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
};

const ToggleCell = ({
  cell,
  field,
  t,
}: {
  cell: Cell<IHelpCenter, unknown>;
  field: 'kbToggle' | 'ticketToggle';
  t: TFunction;
}) => {
  const helpCenter = cell.row.original;
  const checked = Boolean(cell.getValue());
  const { editHelpCenter, loading } = useEditHelpCenter();

  return (
    <RecordTableInlineCell>
      <div className="flex gap-1.5 items-center">
        <Switch
          checked={checked}
          disabled={loading}
          onCheckedChange={(next) =>
            editHelpCenter(helpCenter, { [field]: next })
          }
        />
        <Badge variant={checked ? 'success' : 'secondary'}>
          {checked ? t('on', 'On') : t('off', 'Off')}
        </Badge>
      </div>
    </RecordTableInlineCell>
  );
};

const TitleCell = ({
  cell,
  t,
}: {
  cell: Cell<IHelpCenter, unknown>;
  t: TFunction;
}) => {
  const [, setEditId] = useQueryState<string>('editId');
  const { _id, title } = cell.row.original;

  return (
    <InlineTextCell cell={cell} field="title" placeholder={t('unnamed-topic')}>
      <RecordTableInlineCell.Anchor onClick={() => setEditId(_id)}>
        {title || t('unnamed-topic')}
      </RecordTableInlineCell.Anchor>
    </InlineTextCell>
  );
};

const createHelpCenterColumns = (t: TFunction): ColumnDef<IHelpCenter>[] => [
  helpCenterMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IHelpCenter>,
  {
    id: 'title',
    accessorKey: 'title',
    size: 240,
    header: () => (
      <RecordTable.InlineHead label={t('col-name')} icon={IconLabelFilled} />
    ),
    cell: ({ cell }) => <TitleCell cell={cell} t={t} />,
  },
  {
    id: 'description',
    accessorKey: 'description',
    size: 260,
    header: () => (
      <RecordTable.InlineHead label={t('description')} icon={IconAlignLeft} />
    ),
    cell: ({ cell }) => <InlineTextCell cell={cell} field="description" />,
  },
  {
    id: 'url',
    accessorKey: 'url',
    size: 220,
    header: () => (
      <RecordTable.InlineHead
        label={t('website', 'Website')}
        icon={IconWorld}
      />
    ),
    cell: ({ cell }) => (
      <InlineTextCell
        cell={cell}
        field="url"
        placeholder={t('website', 'Website')}
      />
    ),
  },
  {
    id: 'kbLabel',
    accessorKey: 'kbLabel',
    size: 200,
    header: () => (
      <RecordTable.InlineHead
        label={t('knowledgebase-name', 'Knowledge base name')}
        icon={IconMenu2}
      />
    ),
    cell: ({ cell }) => <InlineTextCell cell={cell} field="kbLabel" />,
  },
  {
    id: 'kbTopicId',
    accessorKey: 'kbTopicId',
    size: 200,
    header: () => (
      <RecordTable.InlineHead
        label={t('knowledgebase-topic', 'Knowledge base topic')}
        icon={IconBook}
      />
    ),
    cell: ({ cell }) => <KbTopicCell cell={cell} />,
  },
  {
    id: 'ticketToggle',
    accessorKey: 'ticketToggle',
    size: 120,
    header: () => (
      <RecordTable.InlineHead
        label={t('show-tickets', 'Show tickets')}
        icon={IconTicket}
      />
    ),
    cell: ({ cell }) => <ToggleCell cell={cell} field="ticketToggle" t={t} />,
  },
  {
    id: 'ticketLabel',
    accessorKey: 'ticketLabel',
    size: 200,
    header: () => (
      <RecordTable.InlineHead
        label={t('ticket-name', 'Tickets name')}
        icon={IconMenu2}
      />
    ),
    cell: ({ cell }) => (
      <FeatureLabelCell
        cell={cell}
        field="ticketLabel"
        feature="ticketToggle"
      />
    ),
  },
  {
    id: 'ticketChannelId',
    accessorKey: 'ticketChannelId',
    size: 200,
    header: () => (
      <RecordTable.InlineHead label={t('channel-label')} icon={IconInbox} />
    ),
    cell: ({ cell }) => <TicketChannelCell cell={cell} />,
  },
  {
    id: 'ticketPipelineId',
    accessorKey: 'ticketPipelineId',
    size: 200,
    header: () => (
      <RecordTable.InlineHead
        label={t('pipeline-label')}
        icon={IconLayoutKanban}
      />
    ),
    cell: ({ cell }) => <TicketPipelineCell cell={cell} />,
  },
  {
    id: 'ticketStatusId',
    accessorKey: 'ticketStatusId',
    size: 200,
    header: () => (
      <RecordTable.InlineHead
        label={t('status-label')}
        icon={IconProgressCheck}
      />
    ),
    cell: ({ cell }) => <TicketStatusCell cell={cell} />,
  },
];

export const useHelpCenterColumns = (): ColumnDef<IHelpCenter>[] => {
  const { t } = useTranslation('frontline');

  return useMemo(() => createHelpCenterColumns(t), [t]);
};
