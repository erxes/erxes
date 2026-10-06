import { PopoverScoped, RecordTableInlineCell, Textarea } from 'erxes-ui';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';
import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { InlineEditHint } from './InlineEditHint';

export const FieldTextarea = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldTextareaInCell {...props} />;
  }

  return <FieldTextareaDetail {...props} />;
};

export const FieldTextareaInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;

  const { currentValue, setCurrentValue, onOpenChange, onEscapeKeyDown } =
    useInlineCellEdit<string>(value || '', value, handleChange);

  return (
    <PopoverScoped closeOnEnter scope={props.id} onOpenChange={onOpenChange}>
      <RecordTableInlineCell.Trigger>
        {currentValue}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content onEscapeKeyDown={onEscapeKeyDown}>
        <Textarea
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
        />
        <InlineEditHint />
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
