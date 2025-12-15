import {
  Input,
  Label,
  PopoverScoped,
  RecordTableInlineCell,
  StringArrayInput,
} from 'erxes-ui';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';
import React from 'react';

export const FieldString = (props: SpecificFieldProps) => {
  const { inCell } = props;
  if (inCell) {
    return <FieldStringInCell {...props} />;
  }
  return <FieldStringDetail {...props} />;
};

export const FieldStringInCell = (props: SpecificFieldProps) => {
  const { value, handleChange, field } = props;
  const [currentValue, setCurrentValue] = useState<string[] | string>(
    value
      ? Array.isArray(value)
        ? value.join(', ')
        : value
      : field.multiple
      ? []
      : '',
  );

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
        {Array.isArray(currentValue) ? currentValue.join(', ') : currentValue}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        {field.multiple ? (
          <StringArrayInput
            value={Array.isArray(currentValue) ? currentValue : [currentValue]}
            onValueChange={(value) => setCurrentValue(value)}
            placeholder="Add a text"
          />
        ) : (
          <Input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
          />
        )}
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldStringDetail = (props: SpecificFieldProps) => {
  const id = React.useId();
  const { value, handleChange, field } = props;
  const [currentValue, setCurrentValue] = useState<string[] | string>(
    value
      ? Array.isArray(value)
        ? value.join(', ')
        : value
      : field.multiple
      ? []
      : '',
  );

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{field.name}</Label>
      {field.multiple ? (
        <StringArrayInput
          value={Array.isArray(currentValue) ? currentValue : [currentValue]}
          onValueChange={(value) => setCurrentValue(value)}
          onBlur={() => currentValue !== value && handleChange(currentValue)}
          styleClasses={{
            inlineTagsContainer: 'shadow-xs',
          }}
          placeholder="Add a text"
        />
      ) : (
        <Input
          id={id}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onBlur={() => currentValue !== value && handleChange(currentValue)}
        />
      )}
    </div>
  );
};
