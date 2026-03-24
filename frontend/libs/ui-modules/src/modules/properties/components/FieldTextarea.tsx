import { PopoverScoped, RecordTableInlineCell, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldTextarea = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldTextareaInCell {...props} />;
  }

  return <FieldTextareaDetail {...props} />;
};

export const FieldTextareaInCell = (props: SpecificFieldProps) => {
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
        <Textarea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldTextareaDetail = (props: SpecificFieldProps) => {
  const { value, handleChange, id } = props;
  const [currentValue, setCurrentValue] = useState<string>(value || '');

  return (
    <Textarea
      id={id}
      value={currentValue}
      onChange={(e) => setCurrentValue(e.target.value)}
      onBlur={() => currentValue !== value && handleChange(currentValue)}
    />
  );
};
