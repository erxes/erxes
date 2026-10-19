import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from 'erxes-sdk/react';
import { Button, Form, Input, Select, Sheet, Switch, toast } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm, type Control } from 'react-hook-form';
import { api, errorMessage, type StoredAgent } from './api';
import {
  AGENT_STATUS_OPTIONS,
  AGENT_STATUSES,
  AgentFormSchema,
  findAgentStatus,
  toAgentInput,
  toFormValues,
  type AgentFormValues,
} from './agentForm';

type AgentSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: StoredAgent | null;
};

type NumberFieldProps = {
  control: Control<AgentFormValues>;
  name: 'returnAmount' | 'returnPercent' | 'prepaidPercent' | 'discountPercent';
  label: string;
  max?: number;
};

const NumberField = ({ control, name, label, max }: NumberFieldProps) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Input
            type="number"
            min={0}
            max={max}
            step="any"
            placeholder="Leave empty"
            {...field}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const AgentSheet = ({ open, onOpenChange, agent }: AgentSheetProps) => {
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(AgentFormSchema),
    defaultValues: toFormValues(agent),
  });
  const add = useMutation(api.agents.add);
  const edit = useMutation(api.agents.edit);
  const saving = add.pending || edit.pending;
  const hasReturn = form.watch('hasReturn');

  useEffect(() => {
    if (open) form.reset(toFormValues(agent));
  }, [open, agent, form]);

  const onSubmit = async (values: AgentFormValues) => {
    try {
      const input = toAgentInput(values, agent);

      if (agent) {
        await edit.mutate({ _id: agent._id, agent: input });
      } else {
        await add.mutate(input);
      }

      toast({
        title: agent ? 'Agent updated' : 'Agent added',
        variant: 'success',
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Could not save agent',
        description: errorMessage(error),
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} modal>
      <Sheet.View className="sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>{agent ? 'Edit agent' : 'Add agent'}</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="p-5 overflow-y-auto">
          <Form {...form}>
            <form
              id="agent-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Form.Field
                control={form.control}
                name="number"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Number</Form.Label>
                    <Form.Control>
                      <Input placeholder="e.g. AG-001" {...field} />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Status</Form.Label>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        const status = findAgentStatus(value);
                        if (status) field.onChange(status);
                      }}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value />
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {AGENT_STATUSES.map((status) => (
                          <Select.Item key={status} value={status}>
                            {AGENT_STATUS_OPTIONS[status].label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="hasReturn"
                render={({ field }) => (
                  <Form.Item className="flex items-center justify-between gap-2">
                    <Form.Label>Earns a return</Form.Label>
                    <Form.Control>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              {hasReturn ? (
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    control={form.control}
                    name="returnAmount"
                    label="Return amount"
                  />
                  <NumberField
                    control={form.control}
                    name="returnPercent"
                    label="Return percent"
                    max={100}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <NumberField
                    control={form.control}
                    name="prepaidPercent"
                    label="Prepaid percent"
                    max={100}
                  />
                  <NumberField
                    control={form.control}
                    name="discountPercent"
                    label="Discount percent"
                    max={100}
                  />
                </div>
              )}
            </form>
          </Form>
        </Sheet.Content>
        <Sheet.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="agent-form" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
