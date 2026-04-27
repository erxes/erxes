import { Button, Form, Input, Select } from 'erxes-ui';
import { useAiAgentConnectionForm } from '../../hooks/useAiAgentConnectionForm';

export const AiAgentConnectionForm = ({
  existingApiKeyMask,
}: {
  existingApiKeyMask?: string;
}) => {
  const {
    control,
    setValue,
    modelOptions,
    isReplacingApiKey,
    setIsReplacingApiKey,
  } = useAiAgentConnectionForm();
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
                  <Select.Item value="openai">OpenAI</Select.Item>
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
                      {model.toUpperCase()}
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
