import { useFormContext } from 'react-hook-form';
import { Form, Input, Select, StringArrayInput, Textarea } from 'erxes-ui';
import { TOAuthClientsForm } from '../hooks/useOAuthClientsForm';
import { OAuthClientLogoUpload } from './OAuthClientLogoUpload';

export const OAuthClientForm = () => {
  const form = useFormContext<TOAuthClientsForm>();

  return (
    <div className="flex flex-col gap-3">
      <Form.Field
        control={form.control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Name</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="erxes-local" />
            </Form.Control>
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
              <Textarea
                {...field}
                value={field.value || ''}
                placeholder="Short description for this client"
                className="min-h-24 resize-none"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="logo"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Logo</Form.Label>
            <Form.Control>
              <OAuthClientLogoUpload
                value={field.value || ''}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Client type</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Form.Control>
                <Select.Trigger>
                  <Select.Value placeholder="Choose a type" />
                </Select.Trigger>
              </Form.Control>
              <Select.Content>
                <Select.Item value="public">Public</Select.Item>
                <Select.Item value="confidential">Confidential</Select.Item>
              </Select.Content>
            </Select>
            <Form.Description>
              Use public for local tools and device flow. Confidential clients
              get a one-time secret during creation.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={form.control}
        name="redirectUrls"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Redirect URLs</Form.Label>
            <Form.Control>
              <StringArrayInput
                value={field.value || []}
                onValueChange={field.onChange}
                placeholder="Add a callback URL"
              />
            </Form.Control>
            <Form.Description>
              Optional. Leave empty for device-flow or polling-only clients.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
