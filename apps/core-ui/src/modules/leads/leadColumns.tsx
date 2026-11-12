import type { LeadRecordType, LeadStage } from '@erxes/core-contract';
import { IconActivity, IconCheck, IconHourglass, IconProgress, IconWorld } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { Command, PopoverScoped, RecordTable, RecordTableInlineCell, RelativeDateDisplay } from 'erxes-ui';
import { useState } from 'react';
import { DisqualifyDialog } from './LeadActions';
import { LeadStageBadge, LeadStagePill } from './LeadStageBadge';
import { daysSince, type LeadRecord, useLeadStages, useMoveLeads } from './useLeads';

/** The stage pill in a table row: the table's own inline popover (a plain dropdown mispositions inside the grid). */
const LeadStageCell = ({ recordType, record }: { recordType: LeadRecordType; record: LeadRecord }) => {
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
      <DisqualifyDialog recordType={recordType} ids={[record.id]} stageId={disqualifying} onClose={() => setDisqualifying(null)} />
    </>
  );
};

const Muted = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-8 items-center px-2 text-xs font-medium text-muted-foreground">{children}</div>
);

/** The stage as a status pill: first in a lead table, click to move the lead. */
const stageColumn = <T extends LeadRecord>(recordType: LeadRecordType): ColumnDef<T> => ({
  id: 'leadStage',
  accessorKey: 'leadStageId',
  header: () => <RecordTable.InlineHead label="Stage" icon={IconProgress} />,
  cell: ({ row }) => <LeadStageCell recordType={recordType} record={row.original} />,
  size: 150,
});

/** Days in the stage, after the name. */
const inStageColumns = <T extends LeadRecord>(): ColumnDef<T>[] => [
  {
    id: 'inStage',
    accessorKey: 'leadStageChangedAt',
    header: () => <RecordTable.InlineHead label="In stage" icon={IconHourglass} />,
    cell: ({ row }) => {
      const days = daysSince(row.original.leadStageChangedAt);

      return <Muted>{days === null ? '' : days === 0 ? 'Today' : `${days} d`}</Muted>;
    },
    size: 100,
  },
];

/** Every person and company: where they came from, and their newest timeline entry. */
export const originColumns = <T extends LeadRecord & { lastActivityAt: string }>(): ColumnDef<T>[] => [
  {
    id: 'source',
    accessorKey: 'source',
    header: () => <RecordTable.InlineHead label="Source" icon={IconWorld} />,
    cell: ({ row }) => (
      <Muted>
        <span className="capitalize">{row.original.source ?? ''}</span>
        {row.original.sourceDetails.campaign && <span className="ml-1 truncate">· {row.original.sourceDetails.campaign}</span>}
      </Muted>
    ),
    size: 160,
  },
  {
    id: 'lastActivityAt',
    accessorKey: 'lastActivityAt',
    header: () => <RecordTable.InlineHead label="Last activity" icon={IconActivity} />,
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
 * `columns` with, for leads, the stage pill first (after the checkbox) and
 * days in it after `afterId`; then origin columns, then `rest`.
 */
export const withLifecycleColumns = <T extends LeadRecord & { lastActivityAt: string }>(
  columns: ColumnDef<T>[],
  afterId: string,
  recordType: LeadRecordType,
  isLead: boolean,
  rest: ColumnDef<T>[],
) => {
  if (!isLead) return [...columns, ...originColumns<T>(), ...rest];

  const first = columns.findIndex((column) => column.id === 'checkbox') + 1;
  const withStage = [...columns.slice(0, first), stageColumn<T>(recordType), ...columns.slice(first)];
  const at = withStage.findIndex((column) => column.id === afterId) + 1;

  return [...withStage.slice(0, at), ...inStageColumns<T>(), ...withStage.slice(at), ...originColumns<T>(), ...rest];
};

/** Sticky columns of a list: leads keep their stage in view too. */
export const stickyWithStage = (sticky: string[], isLead: boolean) => (isLead ? [...sticky.slice(0, 2), 'leadStage', ...sticky.slice(2)] : sticky);
