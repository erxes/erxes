import { Input, PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';

export const FieldString = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldStringInCell {...props} />;
  }

  return <FieldStringDetail {...props} />;
};

export const FieldStringInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;

  const [currentValue, setCurrentValue] = useState<string>(value || '');

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
        {currentValue}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Input
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldStringDetail = (props: SpecificFieldProps) => {
  const { value, handleChange, onInputChange, id } = props;
  const [currentValue, setCurrentValue] = useState<string>(value || '');

  return (
    <Input
      id={id}
      value={currentValue}
      onChange={(e) => {
        setCurrentValue(e.target.value);
        onInputChange?.(e.target.value);
      }}
      onBlur={() => currentValue !== value && handleChange(currentValue)}
    />
  );
};
