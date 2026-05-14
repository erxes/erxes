import { NumberInput, PopoverScoped } from 'erxes-ui';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldNumber = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldNumberInCell {...props} />;
  }

  return <FieldNumberDetail {...props} />;
};

export const FieldNumberInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;
  const [currentValue, setCurrentValue] = useState<number>(value);
  return (
    <PopoverScoped
      closeOnEnter
      scope={props.id}
      onOpenChange={(open, reason) => {
        if (!open) {
          reason === 'close' && setCurrentValue(value);
          if (reason === 'enter') {
            currentValue !== value && handleChange(currentValue);
          }
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        {currentValue?.toLocaleString()}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <NumberInput
          value={currentValue}
          onChange={(value) => setCurrentValue(value)}
        />
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
