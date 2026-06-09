import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { IconRobot, IconArrowLeft, IconInfoCircle } from '@tabler/icons-react';
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Label,
  Input,
  Select,
  Separator,
  Switch,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import {
  MASTRA_AGENT,
  MASTRA_TOOLS,
  MASTRA_PROVIDERS,
  MASTRA_PROVIDER_CATALOG,
  MASTRA_PROVIDER_MODELS,
} from '~/graphql/queries';
import { MASTRA_AGENT_CREATE, MASTRA_AGENT_UPDATE } from '~/graphql/mutations';

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const FormSection = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <Card className="shadow-none">
    <Card.Header className="pb-3">
      <Card.Title className="text-base">{title}</Card.Title>
      {description && <Card.Description>{description}</Card.Description>}
    </Card.Header>
    <Card.Content className="space-y-4">{children}</Card.Content>
  </Card>
);

const Field = ({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label className="font-medium">{label}</Label>
    {children}
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export const AgentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: '',
    agentId: '',
    description: '',
    instructions: '',
    provider: '',
    model: '',
    toolIds: [] as string[],
    memoryEnabled: true,
    maxSteps: 10,
    isEnabled: true,
  });
  const [autoSlug, setAutoSlug] = useState(true);
  const [customModel, setCustomModel] = useState(false);

  const { data: agentData } = useQuery(MASTRA_AGENT, { variables: { _id: id }, skip: !isEdit });
  const { data: toolsData } = useQuery(MASTRA_TOOLS);
  const { data: providersData } = useQuery(MASTRA_PROVIDERS);
  const { data: catalogData } = useQuery(MASTRA_PROVIDER_CATALOG);
  const { data: providerModelsData, loading: modelsLoading } = useQuery(MASTRA_PROVIDER_MODELS, {
    variables: { provider: form.provider },
    skip: !form.provider,
  });

  const [createAgent, { loading: creating }] = useMutation(MASTRA_AGENT_CREATE, {
    onCompleted: () => navigate('/settings/mastra/agents'),
  });
  const [updateAgent, { loading: updating }] = useMutation(MASTRA_AGENT_UPDATE, {
    onCompleted: () => navigate('/settings/mastra/agents'),
  });

  // Populate form from saved data — runs once when agent data arrives
  useEffect(() => {
    if (isEdit && agentData?.mastraAgent) {
      const a = agentData.mastraAgent;
      setForm({
        name: a.name || '',
        agentId: a.agentId || '',
        description: a.description || '',
        instructions: a.instructions || '',
        provider: a.provider || '',
        model: a.model || '',
        toolIds: a.toolIds || [],
        memoryEnabled: a.memoryEnabled ?? true,
        maxSteps: a.maxSteps ?? 10,
        isEnabled: a.isEnabled ?? true,
      });
      setAutoSlug(false);
    }
  }, [agentData, isEdit]);

  const tools = toolsData?.mastraTools || [];

  // Provider dropdown: preset providers configured via DB or env var, plus any
  // custom DB providers the user added that are not in the presets catalog.
  const catalogConfigured: { provider: string; label: string }[] =
    (catalogData?.mastraProviderCatalog || []).filter((p: any) => p.isConfigured);
  const catalogKeys = new Set(catalogConfigured.map((p: any) => p.provider));
  const customDbProviders = (providersData?.mastraProviders || [])
    .filter((p: any) => p.isEnabled && !catalogKeys.has(p.provider));
  const enabledProviders = [...catalogConfigured, ...customDbProviders];

  // Dynamic models come from the API; no static fallback since the DB doc drives everything
  const modelsForProvider: { id: string; name: string }[] = providerModelsData?.mastraProviderModels ?? [];

  // Always include the currently-selected model in the list so the Select always
  // has a matching item to display — prevents the value from appearing blank while
  // the API model list is still loading.
  const modelListItems = useMemo(() => {
    if (form.model && !customModel && !modelsForProvider.some((m) => m.id === form.model)) {
      return [{ id: form.model, name: form.model }, ...modelsForProvider];
    }
    return modelsForProvider;
  }, [modelsForProvider, form.model, customModel]);

  // Detect whether the saved model is not in the available list (custom entry)
  useEffect(() => {
    if (!isEdit || !agentData?.mastraAgent) return;
    if (modelsLoading) return;
    const savedModel = agentData.mastraAgent.model;
    if (savedModel && modelsForProvider.length > 0 && !modelsForProvider.some((m) => m.id === savedModel)) {
      setCustomModel(true);
    }
  }, [agentData, modelsForProvider, modelsLoading, isEdit]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleNameChange = (v: string) => {
    set('name', v);
    if (autoSlug) set('agentId', toSlug(v));
  };

  const toggleTool = (toolId: string) =>
    set('toolIds', form.toolIds.includes(toolId)
      ? form.toolIds.filter((t) => t !== toolId)
      : [...form.toolIds, toolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.model) return;
    if (isEdit) {
      updateAgent({ variables: { _id: id, doc: form } });
    } else {
      createAgent({ variables: { doc: form } });
    }
  };

  const isSaving = creating || updating;

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/mastra/agents">
                    <IconRobot />
                    Agents
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">{isEdit ? 'Edit Agent' : 'New Agent'}</span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/mastra/agents">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button type="submit" form="agent-form" disabled={isSaving || !form.model}>
            {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <form id="agent-form" onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">

          {/* Basic info */}
          <FormSection title="Basic Info">
            <Field label="Name *">
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Customer Support Agent"
                required
              />
            </Field>

            <Field label="Agent ID *" hint="Unique identifier used by the bot endpoint. Auto-generated from name.">
              <Input
                value={form.agentId}
                onChange={(e) => { setAutoSlug(false); set('agentId', e.target.value); }}
                placeholder="customer-support"
                className="font-mono text-sm"
                required
              />
            </Field>

            <Field label="Description">
              <Input
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="What this agent does"
              />
            </Field>

            <Field label="System Instructions *" hint="This is the system prompt sent to the LLM on every conversation.">
              <Textarea
                value={form.instructions}
                onChange={(e: any) => set('instructions', e.target.value)}
                placeholder="You are a helpful customer support agent for…"
                rows={6}
                required
              />
            </Field>
          </FormSection>

          {/* Model */}
          <FormSection title="AI Model" description="Select the provider and model that powers this agent.">
            {enabledProviders.length === 0 ? (
              <Alert>
                <IconInfoCircle className="size-4" />
                <Alert.Title>No providers configured</Alert.Title>
                <Alert.Description>
                  <Link to="/settings/mastra/providers" className="underline underline-offset-4">
                    Add a provider
                  </Link>{' '}
                  before creating an agent.
                </Alert.Description>
              </Alert>
            ) : (
              <>
                <Field label="Provider *">
                  <Select
                    value={form.provider}
                    onValueChange={(v) => { set('provider', v); set('model', ''); setCustomModel(false); }}
                    required
                  >
                    <Select.Trigger className="w-full border border-border rounded-md px-3 py-2 h-9">
                      <Select.Value placeholder="Select provider…" />
                    </Select.Trigger>
                    <Select.Content>
                      {enabledProviders.map((p: any) => (
                        <Select.Item key={p.provider} value={p.provider}>
                          {p.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </Field>

                <Field
                  label="Model *"
                  hint={modelsLoading ? 'Fetching available models…' : undefined}
                >
                  {customModel ? (
                    <div className="flex gap-2">
                      <Input
                        value={form.model}
                        onChange={(e) => set('model', e.target.value)}
                        placeholder="e.g. meta/llama-3.1-8b-instruct"
                        className="font-mono text-sm flex-1"
                        required
                      />
                      {modelsForProvider.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setCustomModel(false); set('model', ''); }}
                        >
                          Presets
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Select
                      value={form.model}
                      onValueChange={(v) => {
                        if (!v) return;
                        if (v === '__custom__') { setCustomModel(true); set('model', ''); }
                        else set('model', v);
                      }}
                      disabled={!form.provider}
                    >
                      <Select.Trigger className="w-full border border-border rounded-md px-3 py-2 h-9">
                        <Select.Value placeholder={
                          !form.provider ? 'Select a provider first' : 'Select model…'
                        } />
                      </Select.Trigger>
                      <Select.Content>
                        {modelListItems.map((m) => (
                          <Select.Item key={m.id} value={m.id}>
                            {m.name !== m.id ? (
                              <>
                                {m.name}
                                <span className="ml-2 text-xs text-muted-foreground font-mono">({m.id})</span>
                              </>
                            ) : (
                              <span className="font-mono text-sm">{m.id}</span>
                            )}
                          </Select.Item>
                        ))}
                        <Select.Item value="__custom__">
                          <span className="text-muted-foreground italic">Enter model ID manually…</span>
                        </Select.Item>
                      </Select.Content>
                    </Select>
                  )}
                </Field>
              </>
            )}
          </FormSection>

          {/* Tools */}
          <FormSection title="Tools" description="Select which tools this agent can call.">
            {tools.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No tools available.{' '}
                <Link to="/settings/mastra/tools/new" className="underline underline-offset-4">
                  Create tools first.
                </Link>
              </p>
            ) : (
              <div className="space-y-1">
                {tools.map((tool: any) => (
                  <label
                    key={tool._id}
                    className={`flex items-start gap-3 rounded-md p-2.5 cursor-pointer transition-colors hover:bg-accent ${
                      !tool.isEnabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Checkbox
                      className="mt-0.5"
                      checked={form.toolIds.includes(tool.toolId)}
                      onCheckedChange={() => !tool.isEnabled ? null : toggleTool(tool.toolId)}
                      disabled={!tool.isEnabled}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{tool.name}</span>
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded-sm ${
                          tool.type === 'builtin' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                        }`}>{tool.type}</span>
                      </div>
                      {tool.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{tool.description}</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}
          </FormSection>

          {/* Behavior */}
          <FormSection title="Behavior">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Conversation Memory</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Remembers previous messages per conversation thread
                </p>
              </div>
              <Switch
                checked={form.memoryEnabled}
                onCheckedChange={(v) => set('memoryEnabled', v)}
              />
            </div>

            <Separator />

            <Field
              label="Max Tool Steps"
              hint="Max consecutive tool calls the agent can make (default: 10)"
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={form.maxSteps}
                  onChange={(e) => set('maxSteps', parseInt(e.target.value) || 10)}
                  className="w-24"
                />
                <Tooltip.Provider>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <IconInfoCircle className="size-4 text-muted-foreground" />
                    </Tooltip.Trigger>
                    <Tooltip.Content className="max-w-xs">
                      Prevents infinite loops. Raise this if the agent frequently stops mid-task.
                    </Tooltip.Content>
                  </Tooltip>
                </Tooltip.Provider>
              </div>
            </Field>

            <Separator />

            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Disabled agents won't respond to bot webhook requests
                </p>
              </div>
              <Switch
                checked={form.isEnabled}
                onCheckedChange={(v) => set('isEnabled', v)}
              />
            </div>
          </FormSection>

          {/* Mobile submit */}
          <div className="flex gap-3 pb-4 sm:hidden">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Agent'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/settings/mastra/agents">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
