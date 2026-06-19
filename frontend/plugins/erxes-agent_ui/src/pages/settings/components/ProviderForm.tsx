import { IconCheck } from '@tabler/icons-react';
import { Button, Form, Input, Label, Textarea } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { ProviderFormValues } from '../validations';

interface ProviderFormProps {
  form: UseFormReturn<ProviderFormValues>;
  title: string;
  isEdit: boolean;
  isCustom: boolean;
  saving: boolean;
  onSubmit: (values: ProviderFormValues) => void;
  onCancel: () => void;
}

/** Add/edit panel for a single LLM provider. */
export const ProviderForm = ({
  form,
  title,
  isEdit,
  isCustom,
  saving,
  onSubmit,
  onCancel,
}: ProviderFormProps) => (
  <Form {...form}>
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-lg border bg-card p-5 space-y-4"
    >
      <h3 className="font-semibold">
        {isEdit ? 'Edit' : 'Add'} {title}
      </h3>

      {isCustom && (
        <Form.Field
          control={form.control}
          name="provider"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Provider Key *</Form.Label>
              <Form.Control>
                <Input
                  {...field}
                  placeholder="e.g. my-custom-llm"
                  className="font-mono text-sm"
                />
              </Form.Control>
              <Form.Description>
                Unique identifier. Use kebab-case, no spaces.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}

      <Form.Field
        control={form.control}
        name="apiKey"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>API Key</Form.Label>
            <Form.Control>
              <Input {...field} type="password" placeholder="sk-..." />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="baseUrl"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Base URL</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="https://api.example.com/v1" />
            </Form.Control>
            <Form.Description>
              Required for OpenAI-compatible providers. Leave empty for native
              providers.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="modelsEndpoint"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Models Endpoint</Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder="https://api.example.com/v1/models"
              />
            </Form.Control>
            <Form.Description>
              Optional URL to dynamically fetch the list of available models.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="envKey"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Env Key</Form.Label>
            <Form.Control>
              <Input
                {...field}
                placeholder="MY_PROVIDER_API_KEY"
                className="font-mono text-sm"
              />
            </Form.Control>
            <Form.Description>
              Environment variable name for the API key (used when no DB key is
              stored).
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="headersText"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Custom Headers</Form.Label>
            <Form.Control>
              <Textarea
                {...field}
                placeholder={'User-Agent: claude-cli/1.0.65 (external, cli)'}
                rows={3}
                className="font-mono"
              />
            </Form.Control>
            <Form.Description>
              One <code>Header-Name: value</code> per line, sent with every
              request. Required for gated endpoints — e.g. Kimi For Coding only
              serves recognized coding agents, so it needs a{' '}
              <code>User-Agent</code> like{' '}
              <code>claude-cli/1.0.65 (external, cli)</code>.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="isOpenAICompatible"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="providerOpenAI"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <Label htmlFor="providerOpenAI">OpenAI-compatible API</Label>
          </div>
        )}
      />

      <Form.Field
        control={form.control}
        name="isDefault"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="providerDefault"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <Label htmlFor="providerDefault">Set as default provider</Label>
          </div>
        )}
      />

      <Form.Field
        control={form.control}
        name="isEnabled"
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="providerEnabled"
              checked={field.value}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <Label htmlFor="providerEnabled">Enabled</Label>
          </div>
        )}
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          <IconCheck size={16} /> {saving ? 'Saving...' : 'Save'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  </Form>
);
