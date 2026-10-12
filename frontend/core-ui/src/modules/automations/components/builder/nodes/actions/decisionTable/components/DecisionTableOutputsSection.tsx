import { DecisionTableSectionHeader } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableSectionHeader';
import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { DECISION_TABLE_OUTPUT_TYPES } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select } from 'erxes-ui';

const OUTPUT_TYPE_LABELS: Record<
  (typeof DECISION_TABLE_OUTPUT_TYPES)[number],
  string
> = {
  text: 'Text',
  number: 'Number',
  user: 'Team member',
};

export const DecisionTableOutputsSection = () => {
  const { form, outputFields, addOutput, removeOutput } =
    useDecisionTableFormContext();

  return (
    <div className="flex flex-col gap-3">
      <DecisionTableSectionHeader
        title="Outputs"
        description="Values the matched row hands to later actions"
        actionLabel="Add output"
        onAction={addOutput}
      />
      {outputFields.map((field, index) => (
        <div
          key={field.id}
          className="flex items-start gap-2 rounded-lg border bg-background p-3"
        >
          <Form.Field
            control={form.control}
            name={`outputs.${index}.key`}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Input placeholder="assigneeId" {...field} />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name={`outputs.${index}.type`}
            render={({ field }) => (
              <Form.Item className="w-36">
                <Select value={field.value} onValueChange={field.onChange}>
                  <Select.Trigger>
                    <Select.Value />
                  </Select.Trigger>
                  <Select.Content>
                    {DECISION_TABLE_OUTPUT_TYPES.map((outputType) => (
                      <Select.Item key={outputType} value={outputType}>
                        {OUTPUT_TYPE_LABELS[outputType]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Form.Item>
            )}
          />
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
            disabled={outputFields.length <= 1}
            onClick={() => removeOutput(index)}
          >
            <IconTrash className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
