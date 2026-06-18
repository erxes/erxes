import { Link } from 'react-router-dom';
import { IconInfoCircle } from '@tabler/icons-react';
import {
  Alert,
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
import { UseFormReturn } from 'react-hook-form';
import { ClampedNumberInput } from '~/components/ClampedNumberInput';
import { Field, FormSection } from '~/components/FormLayout';
import {
  SelectModel,
  SelectProvider,
  useProviderOptions,
} from '~/components/SelectProviderModel';
import { AgentToolPicker } from './AgentToolPicker';
import { useAvailableErxesTools } from '../hooks/useAvailableErxesTools';
import { AgentFormValues } from '../validations';

// Canonical agent form body — every field group, shared by the Agents settings
// page (AgentFormPage) and the in-chat quick editor (EditAgentDialog). The two
// only differ in chrome (page header vs modal footer) and save behaviour
// (navigate-away vs stay-put), plus whether agentId is editable: on the create
// page it's a writable slug, in edit contexts it keys the bot endpoint and
// every persisted thread, so it stays read-only.
export const AgentFormFields = ({
  form,
  agentIdEditable = false,
  onNameChange,
  onAgentIdChange,
}: {
  form: UseFormReturn<AgentFormValues>;
  /** Create flow only — agentId is the bot-endpoint key, frozen once it exists. */
  agentIdEditable?: boolean;
  /** Lets the create page drive its auto-slug behaviour off the name field. */
  onNameChange?: (value: string) => void;
  /** Lets the create page stop auto-slugging once agentId is hand-edited. */
  onAgentIdChange?: (value: string) => void;
}) => {
  const toolPolicy = form.watch('toolPolicy');
  const provider = form.watch('provider');
  const temperature = form.watch('temperature');

  const { providers: enabledProviders } = useProviderOptions();
  const { operations, loading: availableLoading } = useAvailableErxesTools(
    toolPolicy === 'custom',
  );

  return (
    <>
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
                  onChange={(e) =>
                    onNameChange
                      ? onNameChange(e.target.value)
                      : field.onChange(e.target.value)
                  }
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
                  disabled={!agentIdEditable}
                  onChange={(e) => {
                    onAgentIdChange?.(e.target.value);
                    field.onChange(e.target.value);
                  }}
                  placeholder="customer-support"
                  className="font-mono text-sm"
                />
              </Form.Control>
              <Form.Description>
                {agentIdEditable
                  ? 'Unique identifier used by the bot endpoint. Auto-generated from name.'
                  : 'Identifies the bot endpoint and this agent’s threads — not editable here.'}
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
                This is the system prompt sent to the LLM on every conversation.
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
                onCheckedChange={(v) => field.onChange(v ? 'custom' : 'all')}
              />
            </div>
          )}
        />

        {toolPolicy === 'all' ? (
          <Alert>
            <IconInfoCircle className="size-4" />
            <Alert.Title>Full access</Alert.Title>
            <Alert.Description>
              The agent discovers operations on demand and can run any query or
              mutation across every installed erxes service. Turn on “Restrict
              tool access” to limit it to specific operations.
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

        <Form.Field
          control={form.control}
          name="destructiveOps"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="font-medium">
                  Auto-approve destructive operations
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {field.value === 'allow'
                    ? 'Deletes and merges run immediately, without asking.'
                    : 'Off: the agent asks you to approve each delete or merge before it runs.'}
                </p>
              </div>
              <Switch
                checked={field.value === 'allow'}
                onCheckedChange={(v) => field.onChange(v ? 'allow' : 'ask')}
              />
            </div>
          )}
        />
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
              <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                <ClampedNumberInput
                  field={field}
                  min={1}
                  max={50}
                  fallback={10}
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
                  {temperature != null ? temperature.toFixed(1) : 'Default'}
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
                      values more creative ones. If the provider rejects the
                      configured value (e.g. &quot;only 1 is allowed&quot;), set
                      it to the value the model requires.
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
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />
      </FormSection>
    </>
  );
};
