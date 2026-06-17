import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { ColumnDef } from '@tanstack/react-table';
import {
  IconBulb,
  IconRefresh,
  IconMessageQuestion,
  IconSparkles,
  IconNote,
  IconCalendar,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Empty,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Separator,
  Sheet,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_KNOWLEDGE_DATASET } from '~/graphql/queries';

// Agent Knowledge = the ONE native Mastra dataset "Agent Knowledge (erxes)" — the
// single source of truth for what the agent has been taught. A 👍 on a reply
// writes that turn in (question → approved answer); a 👎 / un-vote removes it.
// This page is a live read of that dataset; Mastra Studio → Datasets reads the
// exact same collection. (curate→measure→apply — see backend
// docs/LANGFUSE-EVAL-HANDOFF.md §9.)

interface IKnowledgeRow {
  _id: string;
  input: string;
  groundTruth: string;
  threadId?: string;
  messageId?: string;
  comment?: string;
  createdAt?: string;
}

// ─── Detail drawer ──────────────────────────────────────────────────────────

const KnowledgeDetailSheet = ({
  item,
  onClose,
}: {
  item: IKnowledgeRow | null;
  onClose: () => void;
}) => (
  <Sheet open={!!item} onOpenChange={(open) => !open && onClose()}>
    <Sheet.View className="w-[44rem] max-w-[92vw] flex flex-col p-0 sm:max-w-[92vw]">
      <Sheet.Header className="gap-2">
        <IconBulb className="size-5 text-primary" />
        <Sheet.Title>Approved knowledge</Sheet.Title>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex-1 min-h-0 overflow-auto p-6 space-y-6">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <IconMessageQuestion className="size-4" />
            Question
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {item?.input}
          </p>
        </section>
        <Separator />
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <IconSparkles className="size-4" />
            Approved answer
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {item?.groundTruth}
          </p>
        </section>
        {item?.comment ? (
          <>
            <Separator />
            <section className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <IconNote className="size-4" />
                Reviewer note
              </div>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {item.comment}
              </p>
            </section>
          </>
        ) : null}
      </Sheet.Content>
    </Sheet.View>
  </Sheet>
);

// ─── Page ───────────────────────────────────────────────────────────────────

export const LearningsIndexPage = () => {
  const { data, loading, refetch } = useQuery(MASTRA_KNOWLEDGE_DATASET, {
    variables: { limit: 500 },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });

  const items: IKnowledgeRow[] = data?.mastraKnowledgeDataset ?? [];
  const [selected, setSelected] = useState<IKnowledgeRow | null>(null);

  const columns = useMemo<ColumnDef<IKnowledgeRow>[]>(
    () => [
      {
        id: 'question',
        accessorKey: 'input',
        header: () => (
          <RecordTable.InlineHead icon={IconMessageQuestion} label="Question" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <button
              type="button"
              onClick={() => setSelected(row.original)}
              className="text-left font-medium hover:underline line-clamp-1 cursor-pointer"
            >
              {row.original.input || 'Untitled'}
            </button>
          </RecordTableInlineCell>
        ),
        size: 360,
      },
      {
        id: 'answer',
        accessorKey: 'groundTruth',
        header: () => (
          <RecordTable.InlineHead icon={IconSparkles} label="Approved answer" />
        ),
        cell: ({ row }) => (
          <RecordTableInlineCell>
            <span className="text-muted-foreground line-clamp-1">
              {row.original.groundTruth}
            </span>
          </RecordTableInlineCell>
        ),
        size: 520,
      },
      {
        id: 'note',
        accessorKey: 'comment',
        header: () => <RecordTable.InlineHead icon={IconNote} label="Note" />,
        cell: ({ row }) =>
          row.original.comment ? (
            <RecordTableInlineCell>
              <Badge variant="secondary" className="max-w-full">
                <span className="truncate">{row.original.comment}</span>
              </Badge>
            </RecordTableInlineCell>
          ) : (
            <RecordTableInlineCell>
              <span className="text-muted-foreground">—</span>
            </RecordTableInlineCell>
          ),
        size: 200,
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: () => (
          <RecordTable.InlineHead icon={IconCalendar} label="Added" />
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
    [],
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
                    Agent knowledge
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        <PageHeader.End>
          <Badge variant="secondary">
            {items.length} approved {items.length === 1 ? 'turn' : 'turns'}
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
              <Empty.Title>No approved knowledge yet</Empty.Title>
              <Empty.Description>
                Give a 👍 on good agent replies in Chat. Each approved turn is
                added to the Mastra dataset automatically and appears here — and
                in Mastra Studio → Datasets for Experiments.
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
            stickyColumns={['question']}
          >
            <RecordTable.CursorProvider
              hasPreviousPage={false}
              hasNextPage={false}
              loading={loading}
              dataLength={items.length}
              sessionKey="erxes_agent_knowledge"
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

      <KnowledgeDetailSheet item={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default LearningsIndexPage;
