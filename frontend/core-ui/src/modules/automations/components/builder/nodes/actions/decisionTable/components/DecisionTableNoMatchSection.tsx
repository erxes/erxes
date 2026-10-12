import { DecisionTableThenCell } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableCells';
import { DecisionTableSectionHeader } from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableSectionHeader';
import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { Form, Label, RadioGroup } from 'erxes-ui';
import { useWatch } from 'react-hook-form';

export const DecisionTableNoMatchSection = () => {
  const { form, outputFields } = useDecisionTableFormContext();
  const mode = useWatch({ control: form.control, name: 'noMatchMode' });
  const outputs = useWatch({ control: form.control, name: 'outputs' });

  return (
    <div className="flex flex-col gap-3">
      <DecisionTableSectionHeader
        title="When no row matches"
        description="Also used when an input comes in empty"
      />
      <Form.Field
        control={form.control}
        name="noMatchMode"
        render={({ field }) => (
          <RadioGroup value={field.value} onValueChange={field.onChange}>
            <label className="flex items-center space-x-2">
              <RadioGroup.Item value="default" id="decision-no-match-default" />
              <Label htmlFor="decision-no-match-default">
                Use default values and continue
              </Label>
            </label>
            <label className="flex items-center space-x-2">
              <RadioGroup.Item value="fail" id="decision-no-match-fail" />
              <Label htmlFor="decision-no-match-fail">
                Stop this run with an error
              </Label>
            </label>
          </RadioGroup>
        )}
      />
      {mode === 'default' && (
        <div className="flex flex-col gap-2 rounded-lg border bg-background p-3">
          {outputFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <span className="w-32 shrink-0 truncate pt-2 text-sm text-muted-foreground">
                {outputs[index]?.key || `Output ${index + 1}`}
              </span>
              <div className="flex-1">
                <DecisionTableThenCell
                  name={`noMatchThen.${index}`}
                  outputIndex={index}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
