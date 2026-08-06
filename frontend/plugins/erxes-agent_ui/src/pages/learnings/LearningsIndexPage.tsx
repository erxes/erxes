import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  IconBulb,
  IconCheck,
  IconPin,
  IconPinFilled,
  IconTrash,
  IconX,
  IconAlertTriangle,
  IconArchive,
  IconUsers,
  IconRepeat,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Empty,
  Separator,
  Skeleton,
  Tooltip,
  useConfirm,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  MASTRA_LEARNINGS,
  MASTRA_LEARNING_STATS,
  MASTRA_LEARNING_STATUS,
} from '~/graphql/queries';
import {
  MASTRA_LEARNING_PIN,
  MASTRA_LEARNING_REMOVE,
  MASTRA_LEARNING_SET_STATUS,
} from '~/graphql/mutations';

// The curation queue for the tenant's shared "Agent knowledge": lessons
// distilled from conversations land here as candidates; approving one makes
// it retrievable by every agent turn (digest + agent-knowledge tool).

interface ILearning {
  _id: string;
  statement: string;
  type: string;
  contextTags?: string[];
  agentId?: string;
  status: string;
  confidence: number;
  evidenceCount: number;
  sourceCount: number;
  pinned?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const STATUS_TABS = [
  { key: 'candidate', label: 'Candidates' },
  { key: 'approved', label: 'Approved' },
  { key: 'conflict', label: 'Conflicts' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'archived', label: 'Archived' },
] as const;

const TYPE_VARIANT: Record<
  string,
  'default' | 'secondary' | 'success' | 'destructive' | 'warning'
> = {
  faq: 'secondary',
  procedure: 'success',
  pitfall: 'warning',
  'product-fact': 'default',
  preference: 'secondary',
};

const LearningCard = ({
  learning,
  onChanged,
}: {
  learning: ILearning;
  onChanged: () => void;
}) => {
  const { confirm } = useConfirm();
  const [setStatus, { loading: statusLoading }] = useMutation(
    MASTRA_LEARNING_SET_STATUS,
    { onCompleted: onChanged },
  );
  const [setPinned] = useMutation(MASTRA_LEARNING_PIN, {
    onCompleted: onChanged,
  });
  const [remove] = useMutation(MASTRA_LEARNING_REMOVE, {
    onCompleted: onChanged,
  });

  const handleRemove = () =>
    confirm({
      message: 'Delete this learning? This cannot be undone.',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(() => remove({ variables: { _id: learning._id } }));

  const confidencePct = Math.round((learning.confidence ?? 0) * 100);

  return (
    <div className="rounded-lg border border-border bg-background p-4 space-y-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed">{learning.statement}</p>
        {learning.status === 'approved' && (
          <Tooltip.Provider>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <button
                  type="button"
                  onClick={() =>
                    setPinned({
                      variables: {
                        _id: learning._id,
                        pinned: !learning.pinned,
                      },
                    })
                  }
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {learning.pinned ? (
                    <IconPinFilled className="size-4 text-primary" />
                  ) : (
                    <IconPin className="size-4" />
                  )}
                </button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {learning.pinned
                  ? 'Unpin from prompt digest'
                  : 'Always include in prompt digest'}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Badge variant={TYPE_VARIANT[learning.type] ?? 'secondary'}>
          {learning.type}
        </Badge>
        {(learning.contextTags || []).map((t) => (
          <Badge key={t} variant="secondary" className="font-normal">
            {t}
          </Badge>
        ))}
        <span className="inline-flex items-center gap-1 ml-1">
          <IconRepeat className="size-3.5" /> {learning.evidenceCount}× seen
        </span>
        <span className="inline-flex items-center gap-1">
          <IconUsers className="size-3.5" /> {learning.sourceCount} source
          {learning.sourceCount !== 1 ? 's' : ''}
        </span>
        <span>· {confidencePct}% confidence</span>
        {learning.createdBy && learning.createdBy !== 'system' && (
          <span>· manual</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 pt-0.5">
        {learning.status !== 'approved' && (
          <Button
            size="sm"
            disabled={statusLoading}
            onClick={() =>
              setStatus({
                variables: { _id: learning._id, status: 'approved' },
              })
            }
          >
            <IconCheck className="size-3.5" /> Approve
          </Button>
        )}
        {learning.status !== 'rejected' && learning.status !== 'archived' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={statusLoading}
            onClick={() =>
              setStatus({
                variables: { _id: learning._id, status: 'rejected' },
              })
            }
          >
            <IconX className="size-3.5" /> Reject
          </Button>
        )}
        {learning.status === 'approved' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={statusLoading}
            onClick={() =>
              setStatus({
                variables: { _id: learning._id, status: 'archived' },
              })
            }
          >
            <IconArchive className="size-3.5" /> Archive
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive ml-auto"
          onClick={handleRemove}
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};

export const LearningsIndexPage = () => {
  const [status, setStatus] = useState<string>('candidate');

  const { data: statusData } = useQuery(MASTRA_LEARNING_STATUS);
  const { data: statsData, refetch: refetchStats } = useQuery(
    MASTRA_LEARNING_STATS,
  );
  const { data, loading, refetch } = useQuery(MASTRA_LEARNINGS, {
    variables: { status, page: 1, perPage: 50 },
    fetchPolicy: 'cache-and-network',
  });

  const learningStatus = statusData?.mastraLearningStatus;
  const stats: Record<string, number> = statsData?.mastraLearningStats || {};
  const list: ILearning[] = data?.mastraLearnings?.list || [];

  const onChanged = () => {
    refetch();
    refetchStats();
  };

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
      </PageHeader>

      <div className="flex-1 min-h-0 overflow-auto">
        <div className="max-w-3xl mx-auto w-full p-4 space-y-4">
          {learningStatus && !learningStatus.enabled && (
            <div className="flex items-start gap-2.5 rounded-lg border border-amber-300/50 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-3 text-sm">
              <IconAlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <p className="font-medium">Agent learning is disabled</p>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Set{' '}
                  <code className="font-mono">ERXES_AGENT_LEARNING=enable</code>{' '}
                  on the erxes-agent service to distill lessons from
                  conversations. Existing approved lessons stay visible here
                  either way.
                </p>
              </div>
            </div>
          )}

          {learningStatus?.enabled && (
            <p className="text-xs text-muted-foreground">
              Lessons are distilled from idle conversations, scrubbed of
              personal data, and auto-approved after{' '}
              {learningStatus.autoPromoteMinSources}+ independent sources at{' '}
              {Math.round((learningStatus.autoPromoteMinConfidence ?? 0) * 100)}
              %+ confidence. Approve candidates manually to share them sooner.
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {STATUS_TABS.map((tab) => {
              const active = status === tab.key;
              const count = stats[tab.key] ?? 0;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatus(tab.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? 'border-primary/50 bg-primary/10 text-primary font-medium'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none ${
                        active ? 'bg-primary/15' : 'bg-muted'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && list.length === 0 ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : list.length === 0 ? (
            <Empty className="border border-dashed">
              <Empty.Header>
                <Empty.Media variant="icon">
                  <IconBulb />
                </Empty.Media>
                <Empty.Title>Nothing here yet</Empty.Title>
                <Empty.Description>
                  {status === 'candidate'
                    ? 'Candidate lessons appear after conversations go idle and the distillation sweep runs.'
                    : `No ${status} learnings.`}
                </Empty.Description>
              </Empty.Header>
            </Empty>
          ) : (
            <div className="space-y-3 pb-8">
              {list.map((l) => (
                <LearningCard key={l._id} learning={l} onChanged={onChanged} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
