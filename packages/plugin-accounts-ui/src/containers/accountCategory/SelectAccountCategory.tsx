import SelectAccountCategory from '@erxes/ui-accounts/src/containers/SelectAccountCategory';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  field?: IField;
  onChange: (name: string, value: string) => void;
};

const SelectCategoryContainer = (props: Props) => {
  const { field, onChange } = props;

  if (field && field.type !== 'accountCategory') {
    return null;
  }

  return (
    <>
      <ControlLabel>Categories:</ControlLabel>
      <SelectAccountCategory
        label="Choose account category"
        name="accountCategoryId"
        initialValue={(field && field.accountCategoryId) || ''}
        onSelect={categoryId =>
          onChange('accountCategoryId', categoryId as string)
        }
        multi={false}
      />
    </>
  );
};

export default SelectCategoryContainer;
