import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  IconRobot,
  IconArrowLeft,
  IconInfoCircle,
} from '@tabler/icons-react';
import {
  Alert,
  Breadcrumb,
  Button,
  Form,
  Input,
  Label,
  Separator,
  Slider,
  Switch,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PageHeader } from 'ui-modules';
import { Field, FormSection } from '~/components/FormLayout';
import {
  SelectModel,
  SelectProvider,
  useProviderOptions,
} from '~/components/SelectProviderModel';
import { AgentToolPicker } from './components/AgentToolPicker';
import { useAgent } from './hooks/useAgent';
import { useAvailableErxesTools } from './hooks/useAvailableErxesTools';
import { useSaveAgent } from './hooks/useSaveAgent';
import {
  AGENT_FORM_DEFAULTS,
  AgentFormValues,
  agentFormSchema,
} from './validations';
import { toSlug } from './utils';

export const AgentFormPage = () => {
  const { id } = useParams();
  const isEdit = !!id;

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: AGENT_FORM_DEFAULTS,
  });

  const [autoSlug, setAutoSlug] = useState(true);

  const { agent } = useAgent(id);
  const toolPolicy = form.watch('toolPolicy');
  const { operations, loading: availableLoading } = useAvailableErxesTools(
    toolPolicy === 'custom',
  );
  const { providers: enabledProviders } = useProviderOptions();
  const { saveAgent, saving } = useSaveAgent(id);

  // Populate form from saved data — runs once when agent data arrives
  useEffect(() => {
    if (isEdit && agent) {
      form.reset({
        name: agent.name || '',
        agentId: agent.agentId || '',
        description: agent.description || '',
        instructions: agent.instructions || '',
        provider: agent.provider || '',
        model: agent.model || '',
        toolPolicy: agent.toolPolicy === 'custom' ? 'custom' : 'all',
        allowedTools: agent.allowedTools || [],
        memoryEnabled: agent.memoryEnabled ?? true,
        maxSteps: agent.maxSteps ?? 10,
        temperature: agent.temperature ?? null,
        isEnabled: agent.isEnabled ?? true,
      });
      setAutoSlug(false);
    }
  }, [agent, isEdit, form]);

  const handleNameChange = (value: string) => {
    form.setValue('name', value, { shouldValidate: true });
    if (autoSlug) form.setValue('agentId', toSlug(value));
  };

  const onSubmit = (doc: AgentFormValues) => saveAgent(doc);

  const model = form.watch('model');
  const provider = form.watch('provider');
  const temperature = form.watch('temperature');

  const saveLabel = isEdit ? 'Save Changes' : 'Create Agent';

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/erxes-agent/agents">
                    <IconRobot />
                    Agents
                  </Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">
                  {isEdit ? 'Edit Agent' : 'New Agent'}
                </span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" asChild>
            <Link to="/settings/erxes-agent/agents">
              <IconArrowLeft /> Back
            </Link>
          </Button>
          <Button type="submit" form="agent-form" disabled={saving || !model}>
            {saving ? 'Saving…' : saveLabel}
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex-1 overflow-auto p-4">
        <Form {...form}>
          <form
            id="agent-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-2xl mx-auto space-y-4"
          >
            <FormSection title="Basic Info">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Name</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        onChange={(e) => handleNameChange(e.target.value)}
                        placeholder="Customer Support Agent"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="agentId"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Agent ID</Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        onChange={(e) => {
                          setAutoSlug(false);
                          field.onChange(e.target.value);
                        }}
                        placeholder="customer-support"
                        className="font-mono text-sm"
                      />
                    </Form.Control>
                    <Form.Description>
                      Unique identifier used by the bot endpoint. Auto-generated
                      from name.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Description</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="What this agent does" />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>System Instructions</Form.Label>
                    <Form.Control>
                      <Textarea
                        {...field}
                        placeholder="You are a helpful customer support agent for…"
                        rows={6}
                      />
                    </Form.Control>
                    <Form.Description>
                      This is the system prompt sent to the LLM on every
                      conversation.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </FormSection>

            <FormSection
              title="AI Model"
              description="Select the provider and model that powers this agent."
            >
              {enabledProviders.length === 0 ? (
                <Alert>
                  <IconInfoCircle className="size-4" />
                  <Alert.Title>No providers configured</Alert.Title>
                  <Alert.Description>
                    <Link
                      to="/settings/erxes-agent/providers"
                      className="underline underline-offset-4"
                    >
                      Add a provider
                    </Link>{' '}
                    before creating an agent.
                  </Alert.Description>
                </Alert>
              ) : (
                <>
                  <Form.Field
                    control={form.control}
                    name="provider"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Provider</Form.Label>
                        <SelectProvider
                          value={field.value}
                          onValueChange={(v) => {
                            field.onChange(v);
                            form.setValue('model', '');
                          }}
                        />
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={form.control}
                    name="model"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Model</Form.Label>
                        <SelectModel
                          provider={provider}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                        <Form.Description>
                          Listed live from the provider's model API.
                        </Form.Description>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </>
              )}
            </FormSection>

            <FormSection
              title="Tool Access"
              description="Control which erxes operations this agent can search and run."
            >
              <Form.Field
                control={form.control}
                name="toolPolicy"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="font-medium">Restrict tool access</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {field.value === 'custom'
                          ? 'This agent can only use the operations selected below.'
                          : 'Off: the agent can search and run any erxes operation (reads and writes).'}
                      </p>
                    </div>
                    <Switch
                      checked={field.value === 'custom'}
                      onCheckedChange={(v) =>
                        field.onChange(v ? 'custom' : 'all')
                      }
                    />
                  </div>
                )}
              />

              {toolPolicy === 'all' ? (
                <Alert>
                  <IconInfoCircle className="size-4" />
                  <Alert.Title>Full access</Alert.Title>
                  <Alert.Description>
                    The agent discovers operations on demand and can run any
                    query or mutation across every installed erxes service. Turn
                    on “Restrict tool access” to limit it to specific
                    operations.
                  </Alert.Description>
                </Alert>
              ) : (
                <Form.Field
                  control={form.control}
                  name="allowedTools"
                  render={({ field }) => (
                    <AgentToolPicker
                      value={field.value}
                      onChange={field.onChange}
                      operations={operations}
                      loading={availableLoading}
                    />
                  )}
                />
              )}
            </FormSection>

            <FormSection title="Behavior">
              <Form.Field
                control={form.control}
                name="memoryEnabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="font-medium">Conversation Memory</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Remembers previous messages per conversation thread
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <Separator />

              <Form.Field
                control={form.control}
                name="maxSteps"
                render={({ field }) => (
                  <Field
                    label="Max Tool Steps"
                    hint="Max consecutive tool calls the agent can make (default: 10)"
                  >
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10) || 10)
                        }
                        className="w-24"
                      />
                      <Tooltip.Provider>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <IconInfoCircle className="size-4 text-muted-foreground" />
                          </Tooltip.Trigger>
                          <Tooltip.Content className="max-w-xs">
                            Prevents infinite loops. Raise this if the agent
                            frequently stops mid-task.
                          </Tooltip.Content>
                        </Tooltip>
                      </Tooltip.Provider>
                    </div>
                  </Field>
                )}
              />

              <Separator />

              <Form.Field
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <Field
                    label="Temperature"
                    hint="Sampling randomness (0–2). Some models only accept a fixed value — e.g. Kimi thinking models require 1."
                  >
                    <div className="flex items-center gap-3">
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value ?? 1]}
                        onValueChange={([v]: number[]) => field.onChange(v)}
                        className="flex-1 max-w-xs"
                      />
                      <span className="w-16 text-sm tabular-nums text-muted-foreground">
                        {temperature != null
                          ? temperature.toFixed(1)
                          : 'Default'}
                      </span>
                      {temperature != null && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => field.onChange(null)}
                        >
                          Use default
                        </Button>
                      )}
                      <Tooltip.Provider>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <IconInfoCircle className="size-4 text-muted-foreground" />
                          </Tooltip.Trigger>
                          <Tooltip.Content className="max-w-xs">
                            Lower values give more deterministic answers, higher
                            values more creative ones. If the provider rejects
                            the configured value (e.g. &quot;only 1 is
                            allowed&quot;), set it to the value the model
                            requires.
                          </Tooltip.Content>
                        </Tooltip>
                      </Tooltip.Provider>
                    </div>
                  </Field>
                )}
              />

              <Separator />

              <Form.Field
                control={form.control}
                name="isEnabled"
                render={({ field }) => (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <Label className="font-medium">Enabled</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Disabled agents won't respond to bot webhook requests
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
            </FormSection>

            <div className="flex gap-3 pb-4 sm:hidden">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : saveLabel}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/settings/erxes-agent/agents">Cancel</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
