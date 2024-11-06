import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  field?: IField;
  onChange: (name: string, value: string) => void;
};

const SelectCategoryContainer = (props: Props) => {
  const { field, onChange } = props;

  if (field && field.type !== 'productCategory') {
    return null;
  }

  return (
    <>
      <ControlLabel>Categories:</ControlLabel>
      <SelectProductCategory
        label="Choose product category"
        name="productCategoryId"
        initialValue={(field && field.productCategoryId) || ''}
        onSelect={categoryId =>
          onChange('productCategoryId', categoryId as string)
        }
        multi={false}
      />
    </>
  );
};

export default SelectCategoryContainer;
