import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IconInfoCircle } from '@tabler/icons-react';
import {
  Alert,
  Button,
  Dialog,
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
import { Field, FormSection } from '~/components/FormLayout';
import {
  SelectModel,
  SelectProvider,
  useProviderOptions,
} from '~/components/SelectProviderModel';
import { AgentToolPicker } from '~/pages/agents/components/AgentToolPicker';
import { useAvailableErxesTools } from '~/pages/agents/hooks/useAvailableErxesTools';
import {
  AGENT_FORM_DEFAULTS,
  AgentFormValues,
  agentFormSchema,
} from '~/pages/agents/validations';
import { IChatAgent } from '~/modules/chat/hooks/useChatAgents';
import { useUpdateAgent } from '~/modules/chat/hooks/useUpdateAgent';

/**
 * In-chat agent editor. Lets you retune the agent powering the current
 * conversation — model, provider, instructions, tools, behaviour — without
 * leaving for the Agents settings page. agentId is intentionally read-only:
 * it keys the bot endpoint and every persisted thread, so changing it here
 * would orphan the conversation you're in.
 */
export const EditAgentDialog = ({
  agent,
  open,
  onOpenChange,
}: {
  agent: IChatAgent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: AGENT_FORM_DEFAULTS,
  });

  const toolPolicy = form.watch('toolPolicy');
  const provider = form.watch('provider');
  const model = form.watch('model');
  const temperature = form.watch('temperature');

  const { providers: enabledProviders } = useProviderOptions();
  const { operations, loading: availableLoading } = useAvailableErxesTools(
    toolPolicy === 'custom',
  );
  const { saveAgent, saving } = useUpdateAgent(agent._id, () =>
    onOpenChange(false),
  );

  // Repopulate every time the dialog opens (or the target agent changes) so a
  // reopened modal never shows a stale draft from a previous edit.
  useEffect(() => {
    if (!open) return;
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
  }, [open, agent, form]);

  const onSubmit = (doc: AgentFormValues) => saveAgent(doc);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-2xl gap-0 p-0">
        <Dialog.Header className="border-b px-5 py-3.5">
          <Dialog.Title>Edit {agent.name}</Dialog.Title>
          <Dialog.Description>
            Change this agent's model, provider and behaviour. Changes apply to
            new messages right away.
          </Dialog.Description>
        </Dialog.Header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="max-h-[65vh] space-y-4 overflow-y-auto px-5 py-4">
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
                      to switch models.
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

              <Separator />

              <FormSection title="Basic Info">
                <Form.Field
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Name</Form.Label>
                      <Form.Control>
                        <Input {...field} placeholder="Customer Support Agent" />
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
                          disabled
                          className="font-mono text-sm"
                        />
                      </Form.Control>
                      <Form.Description>
                        Identifies the bot endpoint and this agent's threads —
                        not editable here.
                      </Form.Description>
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
                          rows={5}
                        />
                      </Form.Control>
                      <Form.Description>
                        The system prompt sent to the LLM on every conversation.
                      </Form.Description>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </FormSection>

              <Separator />

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
                        <Label className="font-medium">
                          Restrict tool access
                        </Label>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {field.value === 'custom'
                            ? 'This agent can only use the operations selected below.'
                            : 'Off: the agent can search and run any erxes operation.'}
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

                {toolPolicy === 'custom' && (
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

              <Separator />

              <FormSection title="Behavior">
                <Form.Field
                  control={form.control}
                  name="memoryEnabled"
                  render={({ field }) => (
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <Label className="font-medium">
                          Conversation Memory
                        </Label>
                        <p className="mt-0.5 text-xs text-muted-foreground">
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
                      hint="Sampling randomness (0–2). Some models only accept a fixed value."
                    >
                      <div className="flex items-center gap-3">
                        <Slider
                          min={0}
                          max={2}
                          step={0.1}
                          value={[field.value ?? 1]}
                          onValueChange={([v]: number[]) => field.onChange(v)}
                          className="max-w-xs flex-1"
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
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Disabling removes the agent from the chat rail and bot
                          webhook
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
            </div>

            <Dialog.Footer className="flex items-center gap-2 border-t px-5 py-3.5">
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/settings/erxes-agent/agents/edit/${agent._id}`}>
                        Open full editor
                      </Link>
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    Edit every setting on the Agents page
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
              <div className="flex-1" />
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="sm">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="sm" disabled={saving || !model}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </Dialog.Footer>
          </form>
        </Form>
      </Dialog.Content>
    </Dialog>
  );
};
