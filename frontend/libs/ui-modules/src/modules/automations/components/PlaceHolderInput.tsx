import { Input } from 'erxes-ui';
import { forwardRef } from 'react';
import { Attributes } from 'ui-modules/modules/automations/components/attributes/Attributes';
import { IField } from 'ui-modules/modules/segments';

type Props = {
  propertyType: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  selectedField?: IField;
  fieldType?: string;
  onlySet?: boolean;
  additionalAttributes?: any[];
};

export const PlaceHolderInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      propertyType,
      value,
      onChange,
      onlySet,
      isDisabled,
      fieldType,
      selectedField,
      additionalAttributes,
    },
    ref,
  ) => {
    return (
      <div className="flex flex-row gap-2">
        <Input
          value={value}
          placeholder="Value"
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          ref={ref}
        />
        <Attributes
          selectedField={selectedField}
          contentType={propertyType}
          value={value}
          onSelect={onChange}
          isForSelectField={fieldType === 'select'}
          customAttributions={additionalAttributes}
        />
      </div>
    );
  },
);

PlaceHolderInput.displayName = 'PlaceHolderInput';
