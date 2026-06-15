import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  IconCheck,
  IconLock,
  IconBrain,
  IconBook,
  IconPaperclip,
} from '@tabler/icons-react';
import { Button, Label, Input, Badge } from 'erxes-ui';
import { MASTRA_SETTINGS, MASTRA_AGENTS } from '~/graphql/queries';
import {
  MASTRA_SETTINGS_SAVE,
  MASTRA_KNOWLEDGE_SYNC,
} from '~/graphql/mutations';

interface AgentOption {
  _id: string;
  agentId: string;
  name: string;
  isEnabled: boolean;
}

interface MemoryStatusView {
  embedder?: string;
  embedderModel?: string;
  qdrantUrl?: string;
  qdrantReachable?: boolean | null;
  collection?: string;
}

interface KnowledgeStatusView extends MemoryStatusView {
  enabled?: boolean;
  enabledTypes?: string[];
  lastSweepAt?: string | null;
  pointCount?: number | null;
  types?: Record<
    string,
    { count: number; points: number; error?: string }
  > | null;
  lastError?: string | null;
}

/** Green/red/grey dot + reachable/unreachable/unknown label for a Qdrant URL. */
const ReachabilityDot = ({ reachable }: { reachable?: boolean | null }) => (
  <span className="inline-flex items-center gap-1.5">
    <span
      className={`inline-block size-2 rounded-full ${
        reachable === true
          ? 'bg-green-500'
          : reachable === false
          ? 'bg-red-500'
          : 'bg-muted-foreground/40'
      }`}
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
const AdvancedMemoryCard = ({
  enabled,
  status,
}: {
  enabled: boolean;
  status?: MemoryStatusView;
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
      Controlled by the <code>ERXES_AGENT_MEMORY</code> environment variable. Set{' '}
      <code>ERXES_AGENT_MEMORY=enable</code> and restart the plugin to turn it
      on.
    </p>
  </div>
);

/**
 * Read-only "Company knowledge" status + a "Sync now" action. Extracted from
 * GeneralSettingsPage to keep that component small. Indexing runs AS the
 * clicking user (Agent = Person); erxes enforces their permissions.
 */
const CompanyKnowledgeCard = ({ status }: { status?: KnowledgeStatusView }) => {
  const [syncKnowledge, { loading: syncing }] = useMutation(
    MASTRA_KNOWLEDGE_SYNC,
    { refetchQueries: [{ query: MASTRA_SETTINGS }] },
  );
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const handleKnowledgeSync = async () => {
    setSyncMsg(null);
    try {
      await syncKnowledge();
      setSyncMsg(
        'Indexing started as you — reload in a moment to see updated status.',
      );
    } catch (err) {
      setSyncMsg(
        err instanceof Error ? err.message : 'Failed to start indexing.',
      );
    }
  };

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

export const GeneralSettingsPage = () => {
  const { data: settingsData } = useQuery(MASTRA_SETTINGS);
  const { data: agentsData } = useQuery(MASTRA_AGENTS);
  const [save, { loading }] = useMutation(MASTRA_SETTINGS_SAVE);

  const [form, setForm] = useState({
    erxesApiUrl: 'http://localhost:4000',
    erxesApiToken: '',
    defaultAgentId: '',
    attachmentsEnabled: true,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsData?.mastraSettings) {
      const s = settingsData.mastraSettings;
      setForm({
        erxesApiUrl: s.erxesApiUrl || 'http://localhost:4000',
        erxesApiToken: s.erxesApiToken || '',
        defaultAgentId: s.defaultAgentId || '',
        attachmentsEnabled: s.attachmentsEnabled !== false,
      });
    }
  }, [settingsData]);

  const agents = agentsData?.mastraAgents || [];

  // Read-only feature statuses — derived from server env vars, display only.
  const advancedMemory = Boolean(settingsData?.mastraSettings?.advancedMemory);
  const memStatus = settingsData?.mastraSettings?.advancedMemoryStatus;
  const knowledgeStatus = settingsData?.mastraSettings?.knowledgeStatus;

  // Detected upload storage (configured in core Settings → File upload).
  const attachmentStorage = settingsData?.mastraSettings?.attachmentStorage;

  const set = (k: string, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await save({ variables: { doc: form } });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">General Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure the Mastra plugin connection to erxes.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Default Agent */}
        <div className="space-y-1.5">
          <Label htmlFor="defaultAgentId">
            Default Agent (for bot webhook)
          </Label>
          <select
            id="defaultAgentId"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.defaultAgentId}
            onChange={(e) => set('defaultAgentId', e.target.value)}
          >
            <option value="">None</option>
            {agents
              .filter((a: AgentOption) => a.isEnabled)
              .map((a: AgentOption) => (
                <option key={a._id} value={a.agentId}>
                  {a.name} ({a.agentId})
                </option>
              ))}
          </select>
          <p className="text-xs text-muted-foreground">
            This agent handles incoming messages from the erxes messenger bot
            endpoint (<code>POST /pl:erxes-agent/bot/:conversationId</code>).
            Set this URL as
            <code> botEndpointUrl</code> in your frontline integration.
          </p>
        </div>

        {/* erxes API URL */}
        <div className="space-y-1.5">
          <Label htmlFor="erxesApiUrl">erxes API URL</Label>
          <Input
            id="erxesApiUrl"
            value={form.erxesApiUrl}
            onChange={(e) => set('erxesApiUrl', e.target.value)}
            placeholder="http://localhost:4000"
          />
          <p className="text-xs text-muted-foreground">
            Used by erxes tools to call the GraphQL gateway
          </p>
        </div>

        {/* erxes API Token */}
        <div className="space-y-1.5">
          <Label htmlFor="erxesApiToken">erxes API Token</Label>
          <Input
            id="erxesApiToken"
            type="password"
            value={form.erxesApiToken}
            onChange={(e) => set('erxesApiToken', e.target.value)}
            placeholder="Bearer token for erxes gateway calls"
          />
          <p className="text-xs text-muted-foreground">
            Also used for GraphQL schema introspection when loading erxes tools
          </p>
        </div>

        {/* Chat file attachments — rides on the instance's existing upload storage */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconPaperclip className="size-4 text-muted-foreground" />
              <span className="font-medium">Chat file attachments</span>
            </div>
            <Badge
              variant={
                attachmentStorage?.configured
                  ? form.attachmentsEnabled
                    ? 'success'
                    : 'secondary'
                  : 'destructive'
              }
            >
              {!attachmentStorage?.configured
                ? 'No storage'
                : form.attachmentsEnabled
                ? 'On'
                : 'Off'}
            </Badge>
          </div>

          <div className="text-xs text-muted-foreground space-y-1 pl-6">
            <div>
              Detected storage:{' '}
              <span className="font-mono">
                {attachmentStorage?.serviceType || 'unknown'}
              </span>{' '}
              {attachmentStorage?.configured
                ? '(configured)'
                : '(not configured)'}
            </div>
          </div>

          <label className="flex items-center gap-2 pl-6 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.attachmentsEnabled}
              disabled={!attachmentStorage?.configured}
              onChange={(e) => set('attachmentsEnabled', e.target.checked)}
            />
            Allow file attachments in agent chat (images, PDF, Excel, Word, …)
          </label>

          <p className="text-xs text-muted-foreground">
            Files are stored in this instance's existing upload storage
            (configured in <strong>Settings → File upload</strong>: AWS S3,
            Cloudflare R2, Azure, GCS or local disk). When no storage is
            configured, conversations stay text-only.
          </p>
        </div>

        <Button type="submit" disabled={loading}>
          {saved ? (
            <>
              <IconCheck size={16} /> Saved
            </>
          ) : loading ? (
            'Saving...'
          ) : (
            'Save Settings'
          )}
        </Button>
      </form>

      <AdvancedMemoryCard enabled={advancedMemory} status={memStatus} />

      <CompanyKnowledgeCard status={knowledgeStatus} />

      {/* Bot webhook info box */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
        <p className="font-semibold">Bot Endpoint Setup</p>
        <p className="text-muted-foreground">
          To connect this agent to the erxes messenger widget:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
          <li>
            Go to <strong>Settings → Integrations → Messenger</strong>
          </li>
          <li>
            Edit an integration and set <strong>Bot Endpoint URL</strong> to:
          </li>
        </ol>
        <code className="block bg-muted px-3 py-2 rounded text-xs">
          http://localhost:3312/pl:erxes-agent/bot
        </code>
        <p className="text-xs text-muted-foreground">
          (Replace <code>3312</code> with your actual port. The gateway proxies
          <code> /pl:erxes-agent/*</code> to port 3312.)
        </p>
      </div>
    </div>
  );
};
