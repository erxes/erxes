import { useState } from 'react';
import { SpecificFieldProps } from './Field';
import {
  Badge,
  isDeeplyEqual,
  PopoverScoped,
  RecordTableInlineCell,
  StringArrayInput,
} from 'erxes-ui';
import { getStringArray } from '../propertyUtils';

export const FieldStringMultiple = (props: SpecificFieldProps) => {
  const { inCell } = props;
  if (inCell) {
    return <FieldStringMultipleInCell {...props} />;
  }
  return <FieldStringMultipleDetail {...props} />;
};

export const FieldStringMultipleInCell = (props: SpecificFieldProps) => {
  const { value, handleChange } = props;

  const [currentValue, setCurrentValue] = useState<string[]>(
    getStringArray(value),
  );

  return (
    <PopoverScoped
      closeOnEnter
      scope={props.id}
      onOpenChange={(open, reason) => {
        if (!open) {
          reason === 'close' && setCurrentValue(value);
          if (reason === 'enter') {
            !isDeeplyEqual(currentValue, value) && handleChange(currentValue);
          }
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        {currentValue.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <StringArrayInput
          value={currentValue}
          onValueChange={(value) => setCurrentValue(value)}
          placeholder="Add a text"
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldStringMultipleDetail = (props: SpecificFieldProps) => {
  const { value, handleChange, id } = props;
  const [currentValue, setCurrentValue] = useState<string[]>(
    getStringArray(value),
  );

  return (
    <StringArrayInput
      id={id}
      value={currentValue}
      onValueChange={(value) => setCurrentValue(value)}
      onBlur={() =>
        !isDeeplyEqual(currentValue, value) && handleChange(currentValue)
      }
      styleClasses={{
        inlineTagsContainer: 'shadow-xs',
      }}
      placeholder="Add a text"
    />
  );
};
