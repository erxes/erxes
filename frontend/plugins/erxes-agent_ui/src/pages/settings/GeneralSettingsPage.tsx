import { useEffect, useState } from 'react';
import { IconCheck, IconCopy, IconPaperclip } from '@tabler/icons-react';
import { Badge, Button, CopyText, Form, Input, cn, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGeneralSettings } from './hooks/useGeneralSettings';
import {
  AdvancedMemoryCard,
  CompanyKnowledgeCard,
} from './components/MemoryStatusCards';
import {
  GENERAL_SETTINGS_DEFAULTS,
  GeneralSettingsValues,
  generalSettingsSchema,
} from './validations';

export const GeneralSettingsPage = () => {
  const { settings, agents, save, saving } = useGeneralSettings();

  // Bot webhook lives behind the gateway at /pl:erxes-agent/bot. Derive its
  // base from the configured gateway URL, falling back to the current origin —
  // never a hardcoded localhost, which would be dead on any real deployment.
  const botBase = (
    settings?.erxesApiUrl ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  ).replace(/\/+$/, '');
  const botEndpointUrl = `${botBase}/pl:erxes-agent/bot`;

  const form = useForm<GeneralSettingsValues>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: GENERAL_SETTINGS_DEFAULTS,
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      form.reset({
        erxesApiUrl: settings.erxesApiUrl || 'http://localhost:4000',
        erxesApiToken: settings.erxesApiToken || '',
        defaultAgentId: settings.defaultAgentId || '',
        attachmentsEnabled: settings.attachmentsEnabled !== false,
      });
    }
  }, [settings, form]);

  // Read-only feature statuses — derived from server env vars, display only.
  const advancedMemory = Boolean(settings?.advancedMemory);
  const memStatus = settings?.advancedMemoryStatus;
  const knowledgeStatus = settings?.knowledgeStatus;

  // Detected upload storage (configured in core Settings → File upload).
  const attachmentStorage = settings?.attachmentStorage;

  const onSubmit = async (doc: GeneralSettingsValues) => {
    try {
      await save({ variables: { doc } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast({ title: 'Settings saved' });
    } catch {
      // Error surfaced to the user via the mutation's onError toast.
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">General Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure the Mastra plugin connection to erxes.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Form.Field
              control={form.control}
              name="defaultAgentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Default Agent (for bot webhook)</Form.Label>
                  <Form.Control>
                    <select
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                    >
                      <option value="">None</option>
                      {agents
                        .filter((a) => a.isEnabled)
                        .map((a) => (
                          <option key={a._id} value={a.agentId}>
                            {a.name} ({a.agentId})
                          </option>
                        ))}
                    </select>
                  </Form.Control>
                  <Form.Description>
                    This agent handles incoming messages from the erxes
                    messenger bot endpoint (
                    <code>POST /pl:erxes-agent/bot/:conversationId</code>). Set
                    this URL as
                    <code> botEndpointUrl</code> in your frontline integration.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="erxesApiUrl"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>erxes API URL</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="http://localhost:4000" />
                  </Form.Control>
                  <Form.Description>
                    Used by erxes tools to call the GraphQL gateway
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="erxesApiToken"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>erxes API Token</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Bearer token for erxes gateway calls"
                    />
                  </Form.Control>
                  <Form.Description>
                    Also used for GraphQL schema introspection when loading
                    erxes tools
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="attachmentsEnabled"
              render={({ field }) => (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconPaperclip className="size-4 text-muted-foreground" />
                      <span className="font-medium">Chat file attachments</span>
                    </div>
                    <Badge
                      variant={
                        attachmentStorage?.configured
                          ? field.value
                            ? 'success'
                            : 'secondary'
                          : 'destructive'
                      }
                    >
                      {!attachmentStorage?.configured
                        ? 'No storage'
                        : field.value
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
                      checked={field.value}
                      disabled={!attachmentStorage?.configured}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    Allow file attachments in agent chat (images, PDF, Excel,
                    Word, …)
                  </label>

                  <p className="text-xs text-muted-foreground">
                    Files are stored in this instance's existing upload storage
                    (configured in <strong>Settings → File upload</strong>: AWS
                    S3, Cloudflare R2, Azure, GCS or local disk). When no
                    storage is configured, conversations stay text-only.
                  </p>
                </div>
              )}
            />

            <Button type="submit" disabled={saving}>
              {saved ? (
                <>
                  <IconCheck size={16} /> Saved
                </>
              ) : saving ? (
                'Saving...'
              ) : (
                'Save Settings'
              )}
            </Button>
          </form>
        </Form>

        <AdvancedMemoryCard enabled={advancedMemory} status={memStatus} />

        <CompanyKnowledgeCard status={knowledgeStatus} />

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
          <CopyText
            value={botEndpointUrl}
            className={cn(
              'block w-full bg-muted px-3 py-2 rounded text-xs font-mono justify-between',
            )}
          >
            <span>{botEndpointUrl}</span>
            <IconCopy className="size-3.5 shrink-0 text-muted-foreground" />
          </CopyText>
          <p className="text-xs text-muted-foreground">
            Derived from the configured <strong>erxes API URL</strong> above (or
            this page's origin). The gateway proxies{' '}
            <code>/pl:erxes-agent/*</code> to the agent service.
          </p>
        </div>
      </div>
    </div>
  );
};
