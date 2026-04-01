import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Form, Input } from 'erxes-ui';
import { useFormContext } from 'react-hook-form';

const toNumber = (value: string) => {
  if (value === '') {
    return 0;
  }

  return Number(value);
};

export const AiAgentRuntimeForm = () => {
  const { control } = useFormContext<TAiAgentForm>();

  return (
    <div className="grid gap-4">
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
                value={field.value ?? 0.2}
                onChange={(event) =>
                  field.onChange(toNumber(event.target.value))
                }
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
                max={4000}
                value={field.value ?? 500}
                onChange={(event) =>
                  field.onChange(toNumber(event.target.value))
                }
              />
            </Form.Control>
            <Form.Description>
              Caps the length of the AI response so automation steps stay fast.
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
                value={field.value ?? 15000}
                onChange={(event) =>
                  field.onChange(toNumber(event.target.value))
                }
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
    </div>
  );
};
