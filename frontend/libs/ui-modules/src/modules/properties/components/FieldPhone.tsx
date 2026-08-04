import { PopoverScoped, RecordTableInlineCell } from 'erxes-ui';
import { PhoneInput } from 'erxes-ui/modules/record-field';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';

export const FieldPhone = (props: SpecificFieldProps) => {
  const { inCell } = props;

  if (inCell) {
    return <FieldPhoneInCell {...props} />;
  }

  return <FieldPhoneDetail {...props} />;
};

export const FieldPhoneInCell = (props: SpecificFieldProps) => {
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
        <PhoneInput
          value={currentValue}
          onChange={(val) => setCurrentValue(val)}
          className="bg-background"
        />
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
