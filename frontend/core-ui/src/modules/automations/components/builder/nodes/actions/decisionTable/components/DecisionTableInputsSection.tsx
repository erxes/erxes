import { DecisionTableSectionHeader } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableSectionHeader';
import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { DECISION_TABLE_INPUT_TYPES } from '@/automations/components/builder/nodes/actions/decisionTable/utils/decisionTableCells';
import { IconTrash } from '@tabler/icons-react';
import { Button, Form, Input, Select } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { PlaceholderInput, TPlaceholderInputSuggestion } from 'ui-modules';

const INPUT_TYPE_LABELS: Record<
  (typeof DECISION_TABLE_INPUT_TYPES)[number],
  string
> = {
  text: 'Text',
  number: 'Number',
  option: 'Option',
  segment: 'Segment',
};

export const DecisionTableInputsSection = () => {
  const { inputFields, addInput } = useDecisionTableFormContext();

  return (
    <div className="flex flex-col gap-3">
      <DecisionTableSectionHeader
        title="Inputs"
        description="Values each row is matched against"
        actionLabel="Add input"
        onAction={addInput}
      />
      {inputFields.map((field, index) => (
        <DecisionTableInputItem key={field.id} index={index} />
      ))}
    </div>
  );
};

const DecisionTableInputItem = ({ index }: { index: number }) => {
  const { form, inputFields, removeInput } = useDecisionTableFormContext();
  const type = useWatch({
    control: form.control,
    name: `inputs.${index}.type`,
  });

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-3">
      <div className="flex items-start gap-2">
        <Form.Field
          control={form.control}
          name={`inputs.${index}.key`}
          render={({ field }) => (
            <Form.Item className="flex-1">
              <Input placeholder="category" {...field} />
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name={`inputs.${index}.type`}
          render={({ field }) => (
            <Form.Item className="w-32">
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {DECISION_TABLE_INPUT_TYPES.map((inputType) => (
                    <Select.Item key={inputType} value={inputType}>
                      {INPUT_TYPE_LABELS[inputType]}
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
          disabled={inputFields.length <= 1}
          onClick={() => removeInput(index)}
        >
          <IconTrash className="size-4" />
        </Button>
      </div>

      {type === 'segment' ? (
        <p className="text-xs text-muted-foreground">
          A row matches when this run's record is in one of the segments named
          in its cell.
        </p>
      ) : (
        <Form.Field
          control={form.control}
          name={`inputs.${index}.value`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Value</Form.Label>
              <PlaceholderInput
                value={field.value ?? ''}
                onChange={field.onChange}
                disabled={[TPlaceholderInputSuggestion.Attribute]}
              >
                <PlaceholderInput.Header />
              </PlaceholderInput>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}

      {type === 'option' && (
        <Form.Field
          control={form.control}
          name={`inputs.${index}.optionsText`}
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Options</Form.Label>
              <Input placeholder="light, waste, road" {...field} />
              <Form.Description>
                Comma separated. Rows pick from these, and values no row covers
                are flagged.
              </Form.Description>
            </Form.Item>
          )}
        />
      )}

      {type === 'number' && (
        <div className="flex items-end gap-2">
          <Form.Field
            control={form.control}
            name={`inputs.${index}.rangeMin`}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Label>Lowest value</Form.Label>
                <Input type="number" placeholder="1" {...field} />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name={`inputs.${index}.rangeMax`}
            render={({ field }) => (
              <Form.Item className="flex-1">
                <Form.Label>Highest value</Form.Label>
                <Input type="number" placeholder="24" {...field} />
              </Form.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};
