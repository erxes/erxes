import {
  DecisionTableOptionCell,
  DecisionTableSegmentCell,
} from '@/automations/components/builder/nodes/actions/decisionTable/components/DecisionTableListCells';
import { useDecisionTableFormContext } from '@/automations/components/builder/nodes/actions/decisionTable/context/DecisionTableFormContext';
import { toDecisionTableInput } from '@/automations/components/builder/nodes/actions/decisionTable/states/decisionTableForm';
import { Form, Input } from 'erxes-ui';
import { useWatch } from 'react-hook-form';
import { SelectMember } from 'ui-modules';

const CELL_PLACEHOLDER = {
  number: '1-6, 20',
  text: 'value, other value',
} as const;

export const DecisionTableWhenCell = ({
  rowIndex,
  inputIndex,
}: {
  rowIndex: number;
  inputIndex: number;
}) => {
  const { form } = useDecisionTableFormContext();
  const formInput = useWatch({
    control: form.control,
    name: `inputs.${inputIndex}`,
  });
  const input = toDecisionTableInput(formInput);

  return (
    <Form.Field
      control={form.control}
      name={`rows.${rowIndex}.when.${inputIndex}`}
      render={({ field }) => (
        <Form.Item>
          {input.type === 'segment' ? (
            <DecisionTableSegmentCell
              value={field.value ?? ''}
              onChange={field.onChange}
            />
          ) : input.type === 'option' && input.options.length ? (
            <DecisionTableOptionCell
              value={field.value ?? ''}
              onChange={field.onChange}
              options={input.options}
            />
          ) : (
            <Input
              className="min-w-28"
              placeholder={
                input.type === 'number'
                  ? CELL_PLACEHOLDER.number
                  : CELL_PLACEHOLDER.text
              }
              {...field}
            />
          )}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const DecisionTableThenCell = ({
  name,
  outputIndex,
}: {
  name: `rows.${number}.then.${number}` | `noMatchThen.${number}`;
  outputIndex: number;
}) => {
  const { form } = useDecisionTableFormContext();
  const type = useWatch({
    control: form.control,
    name: `outputs.${outputIndex}.type`,
  });

  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          {type === 'user' ? (
            <SelectMember
              className="min-w-40"
              value={field.value || undefined}
              onValueChange={(value) => field.onChange(value ?? '')}
            />
          ) : (
            <Input
              className="min-w-28"
              type={type === 'number' ? 'number' : 'text'}
              {...field}
            />
          )}
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
