import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { IconCheck } from '@tabler/icons-react';
import { Button, Label, Input } from 'erxes-ui';
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
    memoryDbPath: 'file:./mastra-memory.db',
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsData?.mastraSettings) {
      const s = settingsData.mastraSettings;
      setForm({
        erxesApiUrl: s.erxesApiUrl || 'http://localhost:4000',
        erxesApiToken: s.erxesApiToken || '',
        defaultAgentId: s.defaultAgentId || '',
        memoryDbPath: s.memoryDbPath || 'file:./mastra-memory.db',
      });
    }
  }, [settingsData]);

  const agents = agentsData?.mastraAgents || [];

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

        {/* Memory DB Path */}
        <div className="space-y-1.5">
          <Label htmlFor="memoryDbPath">Memory Database Path</Label>
          <Input
            id="memoryDbPath"
            value={form.memoryDbPath}
            onChange={(e) => set('memoryDbPath', e.target.value)}
            placeholder="file:./mastra-memory.db"
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">LibSQL path for storing agent conversation memory (LibSQLStore)</p>
        </div>

        <Button type="submit" disabled={loading}>
          {saved ? <><IconCheck size={16} /> Saved</> : loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>

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
