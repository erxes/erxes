import { NumberInput, PopoverScoped } from 'erxes-ui';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';
import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { InlineEditHint } from './InlineEditHint';

export const FieldNumber = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldNumberInCell {...props} />;
  }

  return <FieldNumberDetail {...props} />;
};

export const FieldNumberInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;
  const { currentValue, setCurrentValue, onOpenChange, onEscapeKeyDown } =
    useInlineCellEdit<number>(value, value, handleChange);
  return (
    <PopoverScoped closeOnEnter scope={props.id} onOpenChange={onOpenChange}>
      <RecordTableInlineCell.Trigger>
        {currentValue?.toLocaleString()}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content onEscapeKeyDown={onEscapeKeyDown}>
        <NumberInput
          value={currentValue}
          onChange={(value) => setCurrentValue(value)}
        />
        <InlineEditHint />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldNumberDetail = (props: SpecificFieldProps) => {
  const { value, handleChange, onInputChange, id } = props;
  const [currentValue, setCurrentValue] = useState<number>(value);
  return (
    <NumberInput
      id={id}
      value={currentValue}
      onChange={(v) => {
        setCurrentValue(v);
        onInputChange?.(v);
      }}
      onBlur={() => currentValue !== value && handleChange(currentValue)}
    />
  );
};
