import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { IconCheck, IconLock, IconBrain } from '@tabler/icons-react';
import { Button, Label, Input, Badge } from 'erxes-ui';
import { MASTRA_SETTINGS, MASTRA_AGENTS } from '~/graphql/queries';
import { MASTRA_SETTINGS_SAVE } from '~/graphql/mutations';

export const GeneralSettingsPage = () => {
  const { data: settingsData } = useQuery(MASTRA_SETTINGS);
  const { data: agentsData } = useQuery(MASTRA_AGENTS);
  const [save, { loading }] = useMutation(MASTRA_SETTINGS_SAVE);

  const [form, setForm] = useState({
    erxesApiUrl: 'http://localhost:4000',
    erxesApiToken: '',
    defaultAgentId: '',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsData?.mastraSettings) {
      const s = settingsData.mastraSettings;
      setForm({
        erxesApiUrl: s.erxesApiUrl || 'http://localhost:4000',
        erxesApiToken: s.erxesApiToken || '',
        defaultAgentId: s.defaultAgentId || '',
      });
    }
  }, [settingsData]);

  const agents = agentsData?.mastraAgents || [];

  // Read-only "Advanced memory feature" status — derived from the MASTRA_MEMORY
  // env var on the server. Displayed only; not editable from the UI.
  const advancedMemory: boolean = !!settingsData?.mastraSettings?.advancedMemory;
  const memStatus = settingsData?.mastraSettings?.advancedMemoryStatus;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

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
        <p className="text-muted-foreground mt-1">Configure the Mastra plugin connection to erxes.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Default Agent */}
        <div className="space-y-1.5">
          <Label htmlFor="defaultAgentId">Default Agent (for bot webhook)</Label>
          <select
            id="defaultAgentId"
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={form.defaultAgentId}
            onChange={(e) => set('defaultAgentId', e.target.value)}
          >
            <option value="">None</option>
            {agents.filter((a: any) => a.isEnabled).map((a: any) => (
              <option key={a._id} value={a.agentId}>{a.name} ({a.agentId})</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            This agent handles incoming messages from the erxes messenger bot endpoint
            (<code>POST /pl:mastra/bot/:conversationId</code>). Set this URL as
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
          <p className="text-xs text-muted-foreground">Used by erxes tools to call the GraphQL gateway</p>
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
          <p className="text-xs text-muted-foreground">Also used for GraphQL schema introspection when loading erxes tools</p>
        </div>

        <Button type="submit" disabled={loading}>
          {saved ? <><IconCheck size={16} /> Saved</> : loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>

      {/* Advanced memory feature — read-only, controlled by MASTRA_MEMORY env */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconBrain className="size-4 text-muted-foreground" />
            <span className="font-medium">Advanced memory feature</span>
            <IconLock className="size-3.5 text-muted-foreground" />
          </div>
          <Badge variant={advancedMemory ? 'success' : 'secondary'}>
            {advancedMemory ? 'On' : 'Off'}
          </Badge>
        </div>

        {advancedMemory && memStatus && (
          <div className="text-xs text-muted-foreground space-y-1 pl-6">
            <div>
              Embedder:{' '}
              <span className="font-mono">{memStatus.embedderModel}</span>{' '}
              ({memStatus.embedder})
            </div>
            <div className="flex items-center gap-1.5">
              Qdrant: <span className="font-mono">{memStatus.qdrantUrl}</span>
              <span
                className={`inline-block size-2 rounded-full ${
                  memStatus.qdrantReachable === true
                    ? 'bg-green-500'
                    : memStatus.qdrantReachable === false
                      ? 'bg-red-500'
                      : 'bg-muted-foreground/40'
                }`}
              />
              <span>
                {memStatus.qdrantReachable === true
                  ? 'reachable'
                  : memStatus.qdrantReachable === false
                    ? 'unreachable'
                    : 'unknown'}
              </span>
            </div>
            <div>
              Collection:{' '}
              <span className="font-mono">{memStatus.collection}</span>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Controlled by the <code>MASTRA_MEMORY</code> environment variable. Set{' '}
          <code>MASTRA_MEMORY=enable</code> and restart the plugin to turn it on.
        </p>
      </div>

      {/* Bot webhook info box */}
      <div className="rounded-lg border bg-muted/50 p-4 text-sm space-y-2">
        <p className="font-semibold">Bot Endpoint Setup</p>
        <p className="text-muted-foreground">
          To connect this agent to the erxes messenger widget:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
          <li>Go to <strong>Settings → Integrations → Messenger</strong></li>
          <li>Edit an integration and set <strong>Bot Endpoint URL</strong> to:</li>
        </ol>
        <code className="block bg-muted px-3 py-2 rounded text-xs">
          http://localhost:3312/pl:mastra/bot
        </code>
        <p className="text-xs text-muted-foreground">
          (Replace <code>3312</code> with your actual port. The gateway proxies
          <code> /pl:mastra/*</code> to port 3312.)
        </p>
      </div>
    </div>
  );
};
