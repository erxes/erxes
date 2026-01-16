import React from 'react';
import { useAdjustClosingEntryEdit } from '../hooks/useAdjustClosingEdit';
import { SelectAccountFormItem } from '~/modules/settings/account/components/SelectAccount';

interface SelectAccountFieldProps {
  _id: string;
  field: string;
  value?: string;
  placeholder?: string;
  className?: string;
}

export const SelectAccountField: React.FC<SelectAccountFieldProps> = ({
  _id,
  field,
  value,
  placeholder,
  className,
}) => {
  const { adjustClosingEdit } = useAdjustClosingEntryEdit();

  const handleChange = (value: string | string[]) => {
    if (Array.isArray(value)) return;

    adjustClosingEdit({
      variables: {
        _id,
        [field]: value,
      },
    });
  };

  return (
    <SelectAccountFormItem
      value={value ?? ''}
      placeholder={placeholder}
      onValueChange={handleChange}
      className={className}
    />
  );
};
