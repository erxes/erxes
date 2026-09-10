import { AiAgentRuntimeInfo } from '@/automations/components/aiAgent/AiAgentRuntimeInfo';
import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Button, Collapsible, Form, Input } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';

const RUNTIME_DEFAULTS = {
  temperature: 0.2,
  maxTokens: 2000,
  timeoutMs: 15000,
};

// Matches AI_AGENT_LIMITS on the service; a reasoning model can spend
// thousands of tokens thinking before it writes a word.
const MAX_TOKENS_LIMIT = 32768;

const toNumber = (value: string) => {
  if (value === '') {
    return 0;
  }

  return Number(value);
};

export const AiAgentRuntimeForm = () => {
  const { control } = useFormContext<TAiAgentForm>();
  const values = useWatch({ control });

  const temperature = values?.runtime?.temperature ?? RUNTIME_DEFAULTS.temperature;
  const maxTokens = values?.runtime?.maxTokens ?? RUNTIME_DEFAULTS.maxTokens;
  const timeoutMs = values?.runtime?.timeoutMs ?? RUNTIME_DEFAULTS.timeoutMs;

  return (
    <div className="grid gap-4">
      <AiAgentRuntimeInfo
        agent={{
          connection: values?.connection,
          runtime: values?.runtime,
          context: values?.context,
        }}
        title="Agent Budget"
        description="These limits apply to every automation action that uses this agent."
      />

      <Collapsible className="group">
        <Collapsible.Trigger asChild>
          <Button variant="secondary" className="w-full justify-start font-medium">
            <Collapsible.TriggerIcon />
            <span>Advanced limits</span>
          </Button>
        </Collapsible.Trigger>

        <p className="px-3 pt-2 text-xs text-muted-foreground">
          Working defaults are already applied — creativity {temperature}, up to{' '}
          {maxTokens.toLocaleString()} response tokens, giving up after{' '}
          {Math.round(timeoutMs / 1000)}s. Open this only to change them.
        </p>

        <Collapsible.Content className="grid gap-4 pt-4">
          <Form.Field
            control={control}
            name="runtime.temperature"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Temperature</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={2}
                    value={field.value ?? RUNTIME_DEFAULTS.temperature}
                    onChange={(event) => field.onChange(toNumber(event.target.value))}
                  />
                </Form.Control>
                <Form.Description>
                  Lower values keep routing and extraction more deterministic.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="runtime.maxTokens"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Max Tokens</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min={1}
                    max={MAX_TOKENS_LIMIT}
                    value={field.value ?? RUNTIME_DEFAULTS.maxTokens}
                    onChange={(event) => field.onChange(toNumber(event.target.value))}
                  />
                </Form.Control>
                <Form.Description>
                  Caps the whole response. Models with extended thinking spend
                  this budget on reasoning first, so raise it well above the
                  answer length you expect.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="runtime.timeoutMs"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Timeout (ms)</Form.Label>
                <Form.Control>
                  <Input
                    type="number"
                    min={1000}
                    max={30000}
                    value={field.value ?? RUNTIME_DEFAULTS.timeoutMs}
                    onChange={(event) => field.onChange(toNumber(event.target.value))}
                  />
                </Form.Control>
                <Form.Description>
                  The automation waits for the provider until this timeout is
                  reached.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Collapsible.Content>
      </Collapsible>
    </div>
  );
};
