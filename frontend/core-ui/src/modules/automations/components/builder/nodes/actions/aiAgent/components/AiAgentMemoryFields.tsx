import { TAiAgentConfigForm } from '@/automations/components/builder/nodes/actions/aiAgent/states/aiAgentForm';
import { Form, Input, Select, Switch } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';

export const AiAgentMemoryFields = () => {
  const { control } = useFormContext<TAiAgentConfigForm>();

  const readEnabled = useWatch({
    control,
    name: 'memory.read.enabled',
  });

  const writeEnabled = useWatch({
    control,
    name: 'memory.write.enabled',
  });

  return (
    <div className="grid gap-4 rounded-md border bg-muted/20 p-4">
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Memory</h4>
        <p className="text-xs text-muted-foreground">
          Reuse saved AI results in later steps and optionally persist this AI
          result for future actions.
        </p>
      </div>

      <Form.Field
        control={control}
        name="memory.read.enabled"
        render={({ field }) => (
          <Form.Item className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div className="space-y-1">
              <Form.Label>Read From Memory</Form.Label>
              <Form.Description>
                Load previously saved automation memory into this AI step.
              </Form.Description>
            </div>
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />

      {readEnabled && (
        <div className="grid gap-3 rounded-md border bg-background p-3">
          <Form.Field
            control={control}
            name="memory.read.namespace"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Read Namespace</Form.Label>
                <Form.Control>
                  <Input placeholder="main" {...field} />
                </Form.Control>
                <Form.Description>
                  Use the same namespace across related AI actions to share
                  memory.
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />
        </div>
      )}

      <Form.Field
        control={control}
        name="memory.write.enabled"
        render={({ field }) => (
          <Form.Item className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
            <div className="space-y-1">
              <Form.Label>Save Result To Memory</Form.Label>
              <Form.Description>
                Persist this AI result so later actions can reuse it.
              </Form.Description>
            </div>
            <Form.Control>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
          </Form.Item>
        )}
      />

      {writeEnabled && (
        <div className="grid gap-3 rounded-md border bg-background p-3">
          <Form.Field
            control={control}
            name="memory.write.namespace"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Write Namespace</Form.Label>
                <Form.Control>
                  <Input placeholder="main" {...field} />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="memory.write.key"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Memory Key</Form.Label>
                <Form.Control>
                  <Input placeholder="attributes" {...field} />
                </Form.Control>
                <Form.Description>
                  Examples: `lastTopic`, `attributes`, `lastReplyText`
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <Form.Field
            control={control}
            name="memory.write.resultPath"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Result Path</Form.Label>
                <Form.Control>
                  <Input placeholder="attributes" {...field} />
                </Form.Control>
                <Form.Description>
                  Leave empty to save the whole result. Examples: `topicId`,
                  `attributes`, `text`
                </Form.Description>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid gap-3 lg:grid-cols-2">
            <Form.Field
              control={control}
              name="memory.write.mode"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Write Mode</Form.Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select mode" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="replace">Replace</Select.Item>
                      <Select.Item value="merge">Merge</Select.Item>
                    </Select.Content>
                  </Select>
                  <Form.Description>
                    Use `merge` when saving structured attributes.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={control}
              name="memory.write.ttlMinutes"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>TTL (minutes)</Form.Label>
                  <Form.Control>
                    <Input
                      type="number"
                      min={5}
                      max={10080}
                      value={field.value ?? 1440}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    />
                  </Form.Control>
                  <Form.Description>
                    Saved memory expires automatically after this duration.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};
