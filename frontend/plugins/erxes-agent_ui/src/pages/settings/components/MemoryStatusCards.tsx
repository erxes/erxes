import { IconBrain, IconBook, IconLock } from '@tabler/icons-react';
import { Badge, Button, cn } from 'erxes-ui';
import { IKnowledgeStatusView, IMemoryStatusView } from '../types';
import { useKnowledgeSync } from '../hooks/useKnowledgeSync';

/** Green/red/grey dot + reachable/unreachable/unknown label for a Qdrant URL. */
const ReachabilityDot = ({ reachable }: { reachable?: boolean | null }) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className={cn(
        'inline-block size-2 rounded-full',
        reachable === true
          ? 'bg-green-500'
          : reachable === false
            ? 'bg-red-500'
            : 'bg-muted-foreground/40',
      )}
    />
    <span>
      {reachable === true
        ? 'reachable'
        : reachable === false
          ? 'unreachable'
          : 'unknown'}
    </span>
  </span>
);

/** Read-only "Advanced memory" status — controlled by ERXES_AGENT_MEMORY env. */
export const AdvancedMemoryCard = ({
  enabled,
  status,
}: {
  enabled: boolean;
  status?: IMemoryStatusView | null;
}) => (
  <div className="rounded-lg border p-4 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <IconBrain className="size-4 text-muted-foreground" />
        <span className="font-medium">Advanced memory feature</span>
        <IconLock className="size-3.5 text-muted-foreground" />
      </div>
      <Badge variant={enabled ? 'success' : 'secondary'}>
        {enabled ? 'On' : 'Off'}
      </Badge>
    </div>

    {enabled && status && (
      <div className="text-xs text-muted-foreground space-y-1 pl-6">
        <div>
          Embedder: <span className="font-mono">{status.embedderModel}</span> (
          {status.embedder})
        </div>
        <div className="flex items-center gap-1.5">
          Qdrant: <span className="font-mono">{status.qdrantUrl}</span>
          <ReachabilityDot reachable={status.qdrantReachable} />
        </div>
        <div>
          Collection: <span className="font-mono">{status.collection}</span>
        </div>
      </div>
    )}

    <p className="text-xs text-muted-foreground">
      Controlled by the <code>ERXES_AGENT_MEMORY</code> environment variable.
      Set <code>ERXES_AGENT_MEMORY=enable</code> and restart the plugin to turn
      it on.
    </p>
  </div>
);

/**
 * Read-only "Company knowledge" status + a "Sync now" action. Indexing runs AS
 * the clicking user (Agent = Person); erxes enforces their permissions.
 */
export const CompanyKnowledgeCard = ({
  status,
}: {
  status?: IKnowledgeStatusView | null;
}) => {
  const { handleKnowledgeSync, syncing, syncMsg } = useKnowledgeSync();

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <IconBook className="size-4 text-muted-foreground" />
          <span className="font-medium">Company knowledge</span>
          <IconLock className="size-3.5 text-muted-foreground" />
        </div>
        <Badge variant={status?.enabled ? 'success' : 'secondary'}>
          {status?.enabled ? 'On' : 'Off'}
        </Badge>
      </div>

      {status?.enabled && (
        <div className="text-xs text-muted-foreground space-y-1 pl-6">
          <div>
            Embedder: <span className="font-mono">{status.embedderModel}</span>{' '}
            ({status.embedder})
          </div>
          <div className="flex items-center gap-1.5">
            Qdrant: <span className="font-mono">{status.qdrantUrl}</span>
            <ReachabilityDot reachable={status.qdrantReachable} />
          </div>
          <div>
            Collection: <span className="font-mono">{status.collection}</span>
          </div>
          <div>
            Content types:{' '}
            <span className="font-mono">
              {(status.enabledTypes || []).join(', ') || '—'}
            </span>
          </div>
          <div>
            Last sweep:{' '}
            {status.lastSweepAt
              ? `${new Date(status.lastSweepAt).toLocaleString()} — ${
                  status.pointCount ?? 0
                } points`
              : 'not yet run'}
          </div>
          {status.types && (
            <div className="font-mono">
              {Object.entries(status.types)
                .map(([t, s]) => `${t}: ${s.count}${s.error ? ' ⚠' : ''}`)
                .join(' · ')}
            </div>
          )}
          {status.lastError && (
            <div className="text-red-500">Last error: {status.lastError}</div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Lets agents answer from company data via the{' '}
        <code>Company Knowledge</code> tool. Controlled by{' '}
        <code>ERXES_AGENT_KNOWLEDGE</code>; the embedded content types by{' '}
        <code>ERXES_AGENT_KNOWLEDGE_TYPES</code> (default: kb-article only). The
        index is built <strong>as the requesting user</strong> — erxes enforces
        your permissions — and refreshes from usage; there is no unattended
        sweep.
      </p>

      {status?.enabled && (
        <div className="space-y-2 pl-6">
          <Button
            type="button"
            disabled={syncing}
            onClick={handleKnowledgeSync}
          >
            {syncing ? 'Starting…' : 'Sync now'}
          </Button>
          {syncMsg && (
            <p className="text-xs text-muted-foreground">{syncMsg}</p>
          )}
        </div>
      )}
    </div>
  );
};
