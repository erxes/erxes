import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Form, Input, Select, Textarea } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';

export const AiAgentInputMappingFields = () => {
  const { control } = useFormContext<TAiAgentConfigForm>();
  const source = useWatch({
    control,
    name: 'inputMapping.source',
  });

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-4">
      <Form.Field
        control={control}
        name="inputMapping.source"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Input Source</Form.Label>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <Select.Trigger className="mt-1">
                <Select.Value placeholder="Select input source" />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="trigger">Trigger Data</Select.Item>
                <Select.Item value="previousAction">
                  Previous Action Result
                </Select.Item>
                <Select.Item value="custom">Custom Text</Select.Item>
              </Select.Content>
            </Select>
            <Form.Description>
              Choose where the AI action should read its input from.
            </Form.Description>
            <Form.Message />
          </Form.Item>
        )}
      />

      {source === 'trigger' && (
        <Form.Field
          control={control}
          name="inputMapping.path"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Trigger Path</Form.Label>
              <Form.Control>
                <Input placeholder="message" {...field} />
              </Form.Control>
              <Form.Description>
                Leave empty to pass the full trigger payload. Use dot notation
                like `message` or `data.text`.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}

      {source === 'previousAction' && (
        <Form.Field
          control={control}
          name="inputMapping.path"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Previous Action ID</Form.Label>
              <Form.Control>
                <Input placeholder="action-id" {...field} />
              </Form.Control>
              <Form.Description>
                Enter the action ID whose result should be passed into this AI
                step.
              </Form.Description>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}

      {source === 'custom' && (
        <Form.Field
          control={control}
          name="inputMapping.customValue"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Custom Input</Form.Label>
              <Form.Control>
                <Textarea
                  placeholder="Type the exact input you want to send to the AI action"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
