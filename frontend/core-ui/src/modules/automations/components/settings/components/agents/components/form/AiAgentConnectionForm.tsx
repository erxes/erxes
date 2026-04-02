import { TAiAgentForm } from '@/automations/components/settings/components/agents/states/AiAgentFormSchema';
import { Button, Form, Input, Select } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

const OPENAI_COMPATIBLE_MODELS = [
  'gpt-5',
  'gpt-5-mini',
  'gpt-5-nano',
  'gpt-4.1',
  'gpt-4.1-mini',
  'gpt-4o-mini',
];

const formatModelLabel = (model: string) => {
  if (model.startsWith('gpt-')) {
    return model.toUpperCase().replace('GPT-', 'GPT-');
  }

  return model;
};

export const AiAgentConnectionForm = ({
  existingApiKeyMask,
}: {
  existingApiKeyMask?: string;
}) => {
  const { control, watch, setValue } = useFormContext<TAiAgentForm>();
  const [isReplacingApiKey, setIsReplacingApiKey] = useState(false);
  const currentModel = watch('connection.model');
  const modelOptions = useMemo(() => {
    const options = [...OPENAI_COMPATIBLE_MODELS];

    if (currentModel && !options.includes(currentModel)) {
      options.unshift(currentModel);
    }

    return options;
  }, [currentModel]);
  const hasStoredApiKey = !!existingApiKeyMask?.trim();

  return (
    <div className="grid gap-4">
      <Form.Field
        control={control}
        name="connection.provider"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Provider</Form.Label>
            <Form.Control>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select provider" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="openai-compatible">
                    OpenAI Compatible
                  </Select.Item>
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Description>
              Works with OpenAI and compatible gateways that expose the same
              chat completions API shape.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="connection.model"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Model</Form.Label>
            <Form.Control>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select model" />
                </Select.Trigger>
                <Select.Content>
                  {modelOptions.map((model) => (
                    <Select.Item key={model} value={model}>
                      {formatModelLabel(model)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Description>
              Choose the model your provider should use for every automation AI
              action.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="connection.config.apiKey"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>API Key</Form.Label>
            {hasStoredApiKey && !isReplacingApiKey ? (
              <div className="space-y-3">
                <div className="flex h-10 items-center rounded-md border bg-muted/30 px-3">
                  <span className="font-mono text-sm tracking-wide text-muted-foreground">
                    {existingApiKeyMask}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsReplacingApiKey(true)}
                >
                  Replace API key
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Form.Control>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Enter provider API key"
                    {...field}
                  />
                </Form.Control>
                {hasStoredApiKey ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setValue('connection.config.apiKey', '');
                      setIsReplacingApiKey(false);
                    }}
                  >
                    Keep existing key
                  </Button>
                ) : null}
              </div>
            )}
            <Form.Description>
              Existing secrets stay masked. Replace the key only when you want
              to rotate it.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="connection.config.baseUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Base URL</Form.Label>
            <Form.Control>
              <Input placeholder="https://api.openai.com/v1" {...field} />
            </Form.Control>
            <Form.Description>
              Point this to your OpenAI-compatible endpoint. Keep the versioned
              API prefix in the URL.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
