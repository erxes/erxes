import { PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { PhoneInput } from 'erxes-ui/modules/record-field';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';
import { useInlineCellEdit } from '../hooks/useInlineCellEdit';
import { InlineEditHint } from './InlineEditHint';

export const FieldPhone = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldPhoneInCell {...props} />;
  }

  return <FieldPhoneDetail {...props} />;
};

export const FieldPhoneInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;

  const { currentValue, setCurrentValue, onOpenChange, onEscapeKeyDown } =
    useInlineCellEdit<string>(value || '', value, handleChange);

  return (
    <PopoverScoped closeOnEnter scope={props.id} onOpenChange={onOpenChange}>
      <RecordTableInlineCell.Trigger>
        {currentValue}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content onEscapeKeyDown={onEscapeKeyDown}>
        <PhoneInput
          value={currentValue}
          onChange={(val) => setCurrentValue(val)}
          className="bg-background"
        />
        <InlineEditHint />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldPhoneDetail = (props: SpecificFieldProps) => {
  const { value, handleChange, onInputChange, id } = props;
  const [currentValue, setCurrentValue] = useState<string>(value || '');

  return (
    <div
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          if (currentValue !== value) {
            handleChange(currentValue);
          }
        }
      }}
    >
      <PhoneInput
        id={id}
        value={currentValue}
        onChange={(val) => {
          setCurrentValue(val);
          onInputChange?.(val);
        }}
        className="bg-background"
      />
    </div>
  );
};
