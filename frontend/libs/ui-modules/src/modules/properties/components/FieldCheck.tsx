import { Badge, Checkbox, Label } from 'erxes-ui';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldCheck = (props: SpecificFieldProps) => {
  const { field, value, handleChange, id, inCell } = props;
  const [currentValue, setCurrentValue] = useState<string[]>(value || []);

  if (inCell) {
    return (
      <div className="px-2">
        <Badge variant="secondary">Coming soon</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {field.options?.map((option) => (
        <div key={option.value} className="flex gap-2">
          <Checkbox
            id={`${id}_${option.value}`}
            checked={currentValue.includes(option.value)}
            onCheckedChange={() => {
              const newValue = currentValue.includes(option.value)
                ? currentValue.filter((v) => v !== option.value)
                : [...currentValue, option.value];

              setCurrentValue(newValue);
              handleChange(newValue);
            }}
          />

          <Label htmlFor={`${id}_${option.value}`}>{option.label}</Label>
        </div>
      ))}
    </div>
  );
};
