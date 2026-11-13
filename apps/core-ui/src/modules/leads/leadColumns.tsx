import type { LeadRecordType, LeadStage } from '@erxes/core-contract';
import {
  type Icon,
  IconActivity,
  IconCheck,
  IconHourglass,
  IconProgress,
  IconWorld,
} from '@tabler/icons-react';
import type { RecordTableColumnDef } from 'erxes-ui';
import {
  Command,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useState } from 'react';
import { useMinuteClock } from '~/lib/useMinuteClock';
import { DisqualifyDialog } from './DisqualifyDialog';
import { LeadStageBadge, LeadStagePill } from './LeadStageBadge';
import { daysSince, type LeadRecord, useLeadStages, useMoveLeads } from './useLeads';
import { useLeadsT } from './i18n';

/** The stage pill in a table row: the table's own inline popover (a plain dropdown mispositions inside the grid). */
const LeadStageCell = ({
  recordType,
  record,
}: {
  recordType: LeadRecordType;
  record: LeadRecord;
}) => {
  const { stages, byId } = useLeadStages();
  const move = useMoveLeads();
  const [open, setOpen] = useState(false);
  const [disqualifying, setDisqualifying] = useState<string | null>(null);
  const stage = record.leadStageId ? byId.get(record.leadStageId) : null;

  const pick = (next: LeadStage) => {
    setOpen(false);

    if (next.id === record.leadStageId) return;

    if (next.kind === 'disqualified') setDisqualifying(next.id);
    else move.mutate({ recordType, ids: [record.id], stageId: next.id });
  };

  return (
    <>
      <PopoverScoped scope={`lead-stage.${record.id}`} open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger className="px-1">
          <LeadStagePill stage={stage} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content className="w-52">
          <Command>
            <Command.List className="p-1">
              {stages.map((item) => (
                <Command.Item key={item.id} value={item.id} onSelect={() => pick(item)}>
                  <LeadStageBadge stage={item} className="flex-1" />
                  {item.id === record.leadStageId && <IconCheck className="size-4 text-primary" />}
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </RecordTableInlineCell.Content>
      </PopoverScoped>
      <DisqualifyDialog
        recordType={recordType}
        ids={[record.id]}
        stageId={disqualifying}
        onClose={() => setDisqualifying(null)}
      />
    </>
  );
};

const Muted = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-8 items-center px-2 text-xs font-medium text-muted-foreground">
    {children}
  </div>
);

/** A column head labelled from the leads strings. */
const LeadsHead = ({ label, icon }: { label: string; icon: Icon }) => {
  const t = useLeadsT();

  return <RecordTable.InlineHead label={t(label)} icon={icon} />;
};

/** Days since the record entered its stage. */
const InStageCell = ({ changedAt }: { changedAt: string | null }) => {
  const t = useLeadsT();
  const days = daysSince(changedAt, useMinuteClock());

  return (
    <Muted>{days === null ? '' : days === 0 ? t('today') : t('days-count', { count: days })}</Muted>
  );
};

/** The stage as a status pill, right after the name; click to move the lead. */
const stageColumn = <T extends LeadRecord>(
  recordType: LeadRecordType,
): RecordTableColumnDef<T> => ({
  id: 'leadStage',
  accessorKey: 'leadStageId',
  header: () => <LeadsHead label="stage" icon={IconProgress} />,
  cell: ({ row }) => <LeadStageCell recordType={recordType} record={row.original} />,
  size: 150,
});

/** Days in the stage, after the name. */
const inStageColumns = <T extends LeadRecord>(): RecordTableColumnDef<T>[] => [
  {
    id: 'inStage',
    accessorKey: 'leadStageChangedAt',
    header: () => <LeadsHead label="in-stage" icon={IconHourglass} />,
    cell: ({ row }) => <InStageCell changedAt={row.original.leadStageChangedAt} />,
    size: 100,
  },
];

/** Every person and company: where they came from, and their newest timeline entry. */
const originColumns = <
  T extends LeadRecord & { lastActivityAt: string },
>(): RecordTableColumnDef<T>[] => [
  {
    id: 'source',
    accessorKey: 'source',
    header: () => <LeadsHead label="source" icon={IconWorld} />,
    cell: ({ row }) => (
      <Muted>
        <span className="capitalize">{row.original.source ?? ''}</span>
        {row.original.sourceDetails.campaign && (
          <span className="ml-1 truncate">· {row.original.sourceDetails.campaign}</span>
        )}
      </Muted>
    ),
    size: 160,
  },
  {
    id: 'lastActivityAt',
    accessorKey: 'lastActivityAt',
    header: () => <LeadsHead label="last-activity" icon={IconActivity} />,
    cell: ({ row }) => (
      <RelativeDateDisplay value={row.original.lastActivityAt} asChild>
        <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
          <RelativeDateDisplay.Value value={row.original.lastActivityAt} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
  },
];

/**
 * `columns` with, for leads, the stage pill and days in it right after
 * `afterId` (the name); then origin columns, then `rest`.
 */
export const withLifecycleColumns = <T extends LeadRecord & { lastActivityAt: string }>(
  columns: RecordTableColumnDef<T>[],
  afterId: string,
  recordType: LeadRecordType,
  isLead: boolean,
  rest: RecordTableColumnDef<T>[],
) => {
  if (!isLead) return [...columns, ...originColumns<T>(), ...rest];

  const at = columns.findIndex((column) => column.id === afterId) + 1;

  return [
    ...columns.slice(0, at),
    stageColumn<T>(recordType),
    ...inStageColumns<T>(),
    ...columns.slice(at),
    ...originColumns<T>(),
    ...rest,
  ];
};

/** Sticky columns of a list: leads keep their stage (right after the name) in view too. */
export const stickyWithStage = (sticky: string[], isLead: boolean) =>
  isLead ? [...sticky, 'leadStage'] : sticky;
