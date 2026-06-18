import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconBulb,
  IconRefresh,
  IconActivity,
  IconCategory,
  IconChartBar,
  IconUsers,
  IconCalendar,
  IconTag,
  IconPin,
  IconPinFilled,
  IconCircleCheck,
  IconArchive,
  IconCircleX,
  IconTrash,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Combobox,
  Command,
  Empty,
  Popover,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Separator,
  Sheet,
  toast,
  useConfirm,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_LEARNINGS } from '~/graphql/queries';
import {
  MASTRA_LEARNING_PIN,
  MASTRA_LEARNING_SET_STATUS,
  MASTRA_LEARNING_REMOVE,
} from '~/graphql/mutations';

// Agent learnings = the tenant's MastraLearning digest — the PII-free lessons
// distilled from chat (plus manual/curated entries) that are woven into every
// agent turn's system prompt. Thumbs up/down on a reply reinforces or penalizes
// whichever learnings shaped it; this page is where they are reviewed, pinned,
// promoted, and pruned. (See backend mastra/learning/digest.ts — readLearnedDigest.)

interface ILearningRow {
  _id: string;
  statement: string;
  type: string;
  contextTags?: string[];
  agentId?: string;
  status: string;
  confidence?: number;
  evidenceCount?: number;
  sourceCount?: number;
  pinned?: boolean;
  createdBy?: string;
  lastReinforcedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

type StatusFilter = '' | 'approved' | 'candidate' | 'archived' | 'rejected';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'approved', label: 'Approved' },
  { value: 'candidate', label: 'Candidate' },
  { value: 'archived', label: 'Archived' },
];

// approved is retrievable (what the model reads); rejected/conflict are blocked;
// candidate/archived are inert.
const statusVariant = (
  status: string,
): 'success' | 'destructive' | 'secondary' => {
  if (status === 'approved') return 'success';
  if (status === 'rejected' || status === 'conflict') return 'destructive';
  return 'secondary';
};

const confidencePct = (c?: number) =>
  typeof c === 'number' ? `${Math.round(c * 100)}%` : '—';

// ─── Detail drawer ────────────────────────────────────────────────────────────

const LearningDetailSheet = ({
  item,
  onClose,
}: {
  item: ILearningRow | null;
  onClose: () => void;
}) => (
  <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
    <Sheet.View className="w-[40rem] max-w-[92vw] flex flex-col p-0 sm:max-w-[92vw]">
      <Sheet.Header className="gap-2">
        <IconBulb className="size-5 text-primary" />
        <Sheet.Title>Learning</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex-1 min-h-0 overflow-auto p-6 space-y-6">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <IconBulb className="size-4" />
            Statement
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {item?.statement}
          </p>
        </section>
        <Separator />
        <section className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Type
            </div>
            <Badge variant="secondary">{item?.type}</Badge>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </div>
            {item ? (
              <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
            ) : null}
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Confidence
            </div>
            <span>{confidencePct(item?.confidence)}</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Distinct sources
            </div>
            <span>{item?.sourceCount ?? 0}</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Pinned
            </div>
            <span>{item?.pinned ? 'Yes' : 'No'}</span>
          </div>
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Agent
            </div>
            <span>{item?.agentId || 'All agents'}</span>
          </div>
        </section>
        {item?.contextTags?.length ? (
          <>
            <Separator />
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IconTag className="size-4" />
                Context tags
              </div>
              <div className="flex flex-wrap gap-1">
                {item.contextTags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);

// ─── More menu cell ───────────────────────────────────────────────────────────

const LearningMoreCell = ({
  learning,
  refetch,
}: {
  learning: ILearningRow;
  refetch: () => void;
}) => {
  const { confirm } = useConfirm();

  const onError = (e: { message: string }) =>
    toast({ title: 'Error', description: e.message, variant: 'destructive' });

  const [pin] = useMutation(MASTRA_LEARNING_PIN, {
    onCompleted: () => refetch(),
    onError,
  });
  const [setStatus] = useMutation(MASTRA_LEARNING_SET_STATUS, {
    onCompleted: () => refetch(),
    onError,
  });
  const [remove] = useMutation(MASTRA_LEARNING_REMOVE, {
    onCompleted: () => refetch(),
    onError,
  });

  const handleDelete = () =>
    confirm({
      message: 'Remove this learning permanently? This cannot be undone.',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => remove({ variables: { _id: learning._id } }));

  const statusItem = (
    next: string,
    label: string,
    Icon: typeof IconCircleCheck,
  ) =>
    learning.status === next ? null : (
      <Command.Item asChild>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start w-full h-8"
          onClick={() =>
            setStatus({ variables: { _id: learning._id, status: next } })
          }
        >
          <Icon className="size-4" /> {label}
        </Button>
      </Command.Item>
    );

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        side="right"
        align="start"
        avoidCollisions={false}
        className="w-44 min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8"
                onClick={() =>
                  pin({
                    variables: { _id: learning._id, pinned: !learning.pinned },
                  })
                }
              >
                {learning.pinned ? (
                  <>
                    <IconPin className="size-4" /> Unpin
                  </>
                ) : (
                  <>
                    <IconPinFilled className="size-4" /> Pin
                  </>
                )}
              </Button>
            </Command.Item>
            {statusItem('approved', 'Approve', IconCircleCheck)}
            {statusItem('rejected', 'Reject', IconCircleX)}
            {statusItem('archived', 'Archive', IconArchive)}
            <Command.Item asChild>
              <Button
                variant="ghost"
                size="sm"
                className="justify-start w-full h-8 text-destructive"
                onClick={handleDelete}
              >
                <IconTrash className="size-4" /> Delete
              </Button>
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const LearningsIndexPage = () => {
  const [status, setStatus] = useState<StatusFilter>('');
  const [selected, setSelected] = useState<ILearningRow | null>(null);

  const { data, loading, refetch } = useQuery(MASTRA_LEARNINGS, {
    variables: { status: status || undefined, perPage: 200 },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const items: ILearningRow[] = data?.mastraLearnings?.list ?? [];
  const totalCount: number = data?.mastraLearnings?.totalCount ?? items.length;

  const columns = useMemo<ColumnDef<ILearningRow>[]>(
    () => [
      {
        id: 'more',
        cell: ({ row }) => (
          <LearningMoreCell learning={row.original} refetch={refetch} />
        ),
        size: 33,
      },
      {
        id: 'statement',
        accessorKey: 'statement',
        header: () => (
          <RecordTable.InlineHead icon={IconBulb} label="Learning" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="flex items-center gap-1.5 min-w-0">
              {row.original.pinned ? (
                <IconPinFilled className="size-3.5 shrink-0 text-primary" />
              ) : null}
              <button
                type="button"
                onClick={() => setSelected(row.original)}
                className="text-left font-medium hover:underline line-clamp-1 cursor-pointer"
              >
                {row.original.statement || 'Untitled'}
              </button>
            </span>
          </RecordTableInlineCell>
        ),
        size: 420,
      },
      {
        id: 'type',
        accessorKey: 'type',
        header: () => (
          <RecordTable.InlineHead icon={IconCategory} label="Type" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <Badge variant="secondary">{row.original.type}</Badge>
          </RecordTableInlineCell>
        ),
        size: 130,
      },
      {
        id: 'status',
        accessorKey: 'status',
        header: () => (
          <RecordTable.InlineHead icon={IconActivity} label="Status" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <Badge variant={statusVariant(row.original.status)}>
              {row.original.status}
            </Badge>
          </RecordTableInlineCell>
        ),
        size: 120,
      },
      {
        id: 'confidence',
        accessorKey: 'confidence',
        header: () => (
          <RecordTable.InlineHead icon={IconChartBar} label="Confidence" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="font-mono text-xs">
              {confidencePct(row.original.confidence)}
            </span>
          </RecordTableInlineCell>
        ),
        size: 100,
      },
      {
        id: 'sourceCount',
        accessorKey: 'sourceCount',
        header: () => (
          <RecordTable.InlineHead icon={IconUsers} label="Sources" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="text-sm">{row.original.sourceCount ?? 0}</span>
          </RecordTableInlineCell>
        ),
        size: 90,
      },
      {
        id: 'updatedAt',
        accessorKey: 'updatedAt',
        header: () => (
          <RecordTable.InlineHead icon={IconCalendar} label="Updated" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue() as string | undefined;
          return value ? (
            <RelativeDateDisplay value={value} asChild>
              <RecordTableInlineCell>
                <RelativeDateDisplay.Value value={value} />
              </RecordTableInlineCell>
            </RelativeDateDisplay>
          ) : (
            <RecordTableInlineCell>
              <span className="text-muted-foreground">—</span>
            </RecordTableInlineCell>
          );
        },
        size: 130,
      },
    ],
    [refetch],
  );

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/erxes-agent/learnings">
                    <IconBulb />
                    Agent learnings
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <div className="flex items-center gap-1">
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f.value || 'all'}
                variant={status === f.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setStatus(f.value)}
              >
                {f.label}
              </Button>
            ))}
          </div>
          <Badge variant="secondary">
            {totalCount} {totalCount === 1 ? 'learning' : 'learnings'}
          </Badge>
          <Button
            variant="secondary"
            onClick={() => refetch()}
            disabled={loading}
          >
            <IconRefresh /> Refresh
          </Button>
        </PageHeader.End>
      </PageHeader>

      {!loading && items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <Empty className="border border-dashed max-w-md w-full">
            <Empty.Header>
              <Empty.Media variant="icon">
                <IconBulb />
              </Empty.Media>
              <Empty.Title>No learnings yet</Empty.Title>
              <Empty.Description>
                Learnings are distilled from chat over time and reinforced by 👍
                / 👎 on agent replies. Approved learnings are woven into every
                agent turn — they appear here as they accrue.
              </Empty.Description>
            </Empty.Header>
            <Empty.Content>
              <Button variant="secondary" asChild>
                <Link to="/erxes-agent/chat">Open Chat</Link>
              </Button>
            </Empty.Content>
          </Empty>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <RecordTable.Provider
            columns={columns}
            data={items}
            className="m-3"
            stickyColumns={['more', 'statement']}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={false}
              hasNextPage={false}
              loading={loading}
              dataLength={items.length}
              sessionKey="erxes_agent_learnings"
            >
              <RecordTable>
                <RecordTable.Header />
                <RecordTable.Body>
                  {loading && items.length === 0 ? (
                    <RecordTable.RowSkeleton rows={8} />
                  ) : (
                    <RecordTable.RowList />
                  )}
                </RecordTable.Body>
              </RecordTable>
            </RecordTable.CursorProvider>
          </RecordTable.Provider>
        </div>
      )}

      <LearningDetailSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};
