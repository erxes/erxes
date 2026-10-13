import { Badge, Label, RadioGroup } from 'erxes-ui';
import { useState } from 'react';
import { getPickableOptions } from '../propertyUtils';
import { SpecificFieldProps } from './Field';
import { OptionLabel } from './OptionLabel';

export const FieldRadio = (props: SpecificFieldProps) => {
  const { field, value, handleChange, id, inCell } = props;
  const [currentValue, setCurrentValue] = useState<string>(value || '');

  if (inCell) {
    return (
      <div className="px-2">
        <Badge variant="secondary">Coming soon</Badge>
      </div>
    );
  }

  return (
    <RadioGroup
      className="flex flex-col gap-2"
      value={currentValue}
      onValueChange={(value) => {
        setCurrentValue(value);
        handleChange(value);
      }}
    >
      {getPickableOptions(field, [currentValue]).map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroup.Item id={`${id}_${option.value}`} value={option.value} />

          <Label htmlFor={`${id}_${option.value}`}>
            <OptionLabel option={option} />
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
};
