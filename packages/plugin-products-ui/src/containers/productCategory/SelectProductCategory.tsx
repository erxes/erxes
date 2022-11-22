import SelectProductCategory from '@erxes/ui-products/src/containers/SelectProductCategory';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  field?: IField;
  onChange: (name: string, value: string) => void;
};

const SelectCategoryContainer = (props: Props) => {
  return (
    <>
      <ControlLabel>Categories:</ControlLabel>
      <SelectProductCategory
        label="Choose product category"
        name="productCategoryId"
        initialValue={''}
        onSelect={categoryId =>
          props.onChange('productCategoryId', categoryId as string)
        }
        multi={false}
      />
    </>
  );
};

export default SelectCategoryContainer;
