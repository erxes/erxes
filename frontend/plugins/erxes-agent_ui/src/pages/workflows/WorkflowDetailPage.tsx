import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import {
  IconChevronRight,
  IconPencil,
  IconPlayerPlay,
  IconRefresh,
  IconSitemap,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Label,
  Popover,
  Separator,
  Switch,
  Textarea,
  toast,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_WORKFLOW, MASTRA_WORKFLOW_RUNS } from '~/graphql/queries';
import {
  MASTRA_WORKFLOW_RUN_START,
  MASTRA_WORKFLOW_SET_ENABLED,
} from '~/graphql/mutations';
import {
  RunStatusBadge,
  formatDuration,
  stepCount,
  triggerLabel,
} from './shared';
import { WorkflowGraph } from './graph/WorkflowGraph';

const RUNS_PER_PAGE = 30;

const JsonBlock = ({ value }: { value: any }) => (
  <pre className="text-xs font-mono bg-muted rounded-md p-3 overflow-auto max-h-72 whitespace-pre-wrap break-all">
    {JSON.stringify(value, null, 2)}
  </pre>
);

// ─── Run now (with optional JSON payload) ─────────────────────────────────────

const RunNowButton = ({
  workflowId,
  onStarted,
}: {
  workflowId: string;
  onStarted: () => void;
}) => {
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState('');

  const [runStart, { loading }] = useMutation(MASTRA_WORKFLOW_RUN_START, {
    onCompleted: () => {
      toast({ title: 'Run started' });
      setOpen(false);
      onStarted();
    },
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  const handleRun = () => {
    let input: any = {};
    if (payload.trim()) {
      try {
        input = JSON.parse(payload);
      } catch (e: any) {
        toast({
          title: 'Invalid JSON payload',
          description: e.message,
          variant: 'destructive',
        });
        return;
      }
    }
    runStart({ variables: { _id: workflowId, input } });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button>
          <IconPlayerPlay /> Run now
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-96 space-y-3">
        <div>
          <Label className="font-medium">Trigger payload (optional)</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            JSON available to steps as{' '}
            <code className="font-mono">{'{{trigger.payload.*}}'}</code>
          </p>
        </div>
        <Textarea
          value={payload}
          onChange={(e: any) => setPayload(e.target.value)}
          placeholder='{ "customerId": "..." }'
          rows={5}
          className="font-mono text-xs"
        />
        <Button onClick={handleRun} disabled={loading} className="w-full">
          {loading ? 'Starting…' : 'Start run'}
        </Button>
      </Popover.Content>
    </Popover>
  );
};

// ─── Run row ──────────────────────────────────────────────────────────────────

const RunRow = ({ run }: { run: any }) => {
  const [expanded, setExpanded] = useState(false);

  const steps = run.stepsSummary ? Object.entries(run.stepsSummary) : [];

  return (
    <div className="border border-border/60 rounded-md">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-accent text-left"
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <RunStatusBadge status={run.status} />
        <span className="text-xs text-muted-foreground">
          {run.triggerEnvelope?.source || 'manual'}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          v{run.version}
        </span>
        <span className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {formatDuration(run.startedAt, run.finishedAt)}
        </span>
        <span className="text-xs text-muted-foreground">
          {run.startedAt ? new Date(run.startedAt).toLocaleString() : '—'}
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-border/60 pt-3">
          {steps.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Steps
              </p>
              <div className="space-y-1">
                {steps.map(([stepId, summary]: [string, any]) => (
                  <div key={stepId} className="flex items-center gap-2 text-sm">
                    <RunStatusBadge status={summary?.status} />
                    <span className="font-mono text-xs">{stepId}</span>
                    {summary?.error && (
                      <span className="text-xs text-destructive truncate">
                        {summary.error}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {run.error && (
            <div>
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1.5">
                Error
              </p>
              <p className="text-sm text-destructive whitespace-pre-wrap">
                {run.error}
              </p>
            </div>
          )}

          {run.output != null && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Output
              </p>
              <JsonBlock value={run.output} />
            </div>
          )}

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              Trigger
            </p>
            <JsonBlock value={run.triggerEnvelope} />
          </div>

          {run.usage?.llmCalls != null && (
            <p className="text-xs text-muted-foreground">
              LLM calls: {run.usage.llmCalls}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export const WorkflowDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [definitionView, setDefinitionView] = useState<'graph' | 'json'>(
    'graph',
  );

  const { data: workflowData, refetch: refetchWorkflow } = useQuery(
    MASTRA_WORKFLOW,
    { variables: { _id: id }, skip: !id },
  );
  const workflow = workflowData?.mastraWorkflow;

  const {
    data: runsData,
    loading: runsLoading,
    refetch: refetchRuns,
    startPolling,
    stopPolling,
  } = useQuery(MASTRA_WORKFLOW_RUNS, {
    variables: { workflowId: id, page: 1, perPage: RUNS_PER_PAGE },
    skip: !id,
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });

  const runs: any[] = useMemo(
    () => runsData?.mastraWorkflowRuns || [],
    [runsData?.mastraWorkflowRuns],
  );

  const hasActiveRun = runs.some((r) => r.status === 'running');
  const latestRun = runs[0];

  // Live-update while anything is still executing; stop once everything settles.
  useEffect(() => {
    if (hasActiveRun) startPolling(3000);
    else stopPolling();
    return () => stopPolling();
  }, [hasActiveRun, startPolling, stopPolling]);

  const [setEnabled] = useMutation(MASTRA_WORKFLOW_SET_ENABLED, {
    onCompleted: () => refetchWorkflow(),
    onError: (e) =>
      toast({ title: 'Error', description: e.message, variant: 'destructive' }),
  });

  if (!workflow) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading workflow…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/erxes-agent/workflows">
                    <IconSitemap />
                    Workflows
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">{workflow.name}</span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button
            variant="outline"
            onClick={() => navigate(`/erxes-agent/workflows/edit/${id}`)}
          >
            <IconPencil /> Edit
          </Button>
          <RunNowButton
            workflowId={workflow._id}
            onStarted={() => refetchRuns()}
          />
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          {/* Overview */}
          <Card className="shadow-none">
            <Card.Header className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Card.Title className="text-base">{workflow.name}</Card.Title>
                  {workflow.description && (
                    <Card.Description>{workflow.description}</Card.Description>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">
                    {workflow.isEnabled ? 'Enabled' : 'Disabled'}
                  </Label>
                  <Switch
                    checked={workflow.isEnabled}
                    onCheckedChange={(v: boolean) =>
                      setEnabled({
                        variables: { _id: workflow._id, isEnabled: v },
                      })
                    }
                  />
                </div>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">
                  {triggerLabel(workflow.definition)}
                </Badge>
                <Badge variant="secondary">
                  {stepCount(workflow.definition)} step
                  {stepCount(workflow.definition) !== 1 ? 's' : ''}
                </Badge>
                <Badge variant="secondary">v{workflow.version}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  Updated {new Date(workflow.updatedAt).toLocaleString()}
                </span>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant={
                        definitionView === 'graph' ? 'secondary' : 'ghost'
                      }
                      onClick={() => setDefinitionView('graph')}
                    >
                      Graph
                    </Button>
                    <Button
                      size="sm"
                      variant={
                        definitionView === 'json' ? 'secondary' : 'ghost'
                      }
                      onClick={() => setDefinitionView('json')}
                    >
                      JSON
                    </Button>
                  </div>
                  {definitionView === 'graph' && latestRun?.stepsSummary && (
                    <span className="text-xs text-muted-foreground">
                      Step status from the latest run
                    </span>
                  )}
                </div>
                {definitionView === 'graph' ? (
                  <WorkflowGraph
                    definition={workflow.definition}
                    stepsSummary={latestRun?.stepsSummary}
                    className="h-[440px] rounded-md border border-border/60 bg-muted/20"
                  />
                ) : (
                  <JsonBlock value={workflow.definition} />
                )}
              </div>
            </Card.Content>
          </Card>

          {/* Runs */}
          <Card className="shadow-none">
            <Card.Header className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <Card.Title className="text-base">Runs</Card.Title>
                  <Card.Description>
                    Latest {RUNS_PER_PAGE} runs
                    {hasActiveRun ? ' — refreshing live' : ''}
                  </Card.Description>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchRuns()}
                  disabled={runsLoading}
                >
                  <IconRefresh className={runsLoading ? 'animate-spin' : ''} />
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Content className="space-y-2">
              {runs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  {runsLoading
                    ? 'Loading runs…'
                    : 'No runs yet. Use "Run now" to trigger this workflow manually.'}
                </p>
              ) : (
                runs.map((run) => <RunRow key={run._id} run={run} />)
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};
